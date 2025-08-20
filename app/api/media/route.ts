import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { minioClient, bucketName, ensureBucketExists } from '@/lib/minio'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'

// Allowed file types and sizes
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/avi', 'video/ogg']
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES, ...ALLOWED_DOCUMENT_TYPES]
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

// Schema for media query
const mediaQuerySchema = z.object({
  search: z.string().optional(),
  type: z.enum(['all', 'image', 'video', 'document']).default('all'),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  postId: z.string().optional(),
})

// Schema for media upload (simplified - no required postId)
const mediaUploadSchema = z.object({
  altText: z.string().optional(),
  postId: z.string().optional(),
})

// GET /api/media - Get media files with search and filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = mediaQuerySchema.parse({
      search: searchParams.get('search'),
      type: searchParams.get('type'),
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      postId: searchParams.get('postId'),
    })

    // Build where clause
    const where: Prisma.MediaWhereInput = {}
    
    if (query.search) {
      where.OR = [
        { filename: { contains: query.search, mode: 'insensitive' } },
        { originalName: { contains: query.search, mode: 'insensitive' } },
        { altText: { contains: query.search, mode: 'insensitive' } }
      ]
    }

    if (query.postId) {
      where.postId = query.postId
    }

    if (query.type !== 'all') {
      switch (query.type) {
        case 'image':
          where.mimeType = { startsWith: 'image/' }
          break
        case 'video':
          where.mimeType = { startsWith: 'video/' }
          break
        case 'document':
          where.AND = [
            { NOT: { mimeType: { startsWith: 'image/' } } },
            { NOT: { mimeType: { startsWith: 'video/' } } }
          ]
          break
      }
    }

    // If no postId specified, return general media library
    if (!query.postId) {
      const total = await prisma.media.count({ where })
      
      const media = await prisma.media.findMany({
        where,
        include: {
          uploadedBy: {
            select: {
              id: true,
              email: true
            }
          }
        },
        orderBy: {
          uploadedAt: 'desc'
        },
        skip: (query.page - 1) * query.limit,
        take: query.limit
      })

      return NextResponse.json(media)
    }

    // Legacy behavior for post-specific media
    const media = await prisma.media.findMany({
      where,
      orderBy: {
        uploadedAt: 'desc'
      },
    })

    return NextResponse.json(media)
  } catch (error) {
    console.error('Error fetching media:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/media - Upload file to MinIO and save to database
export async function POST(request: NextRequest) {
  try {
    await ensureBucketExists()

    const formData = await request.formData()
    const file = formData.get('file') as File
    const altText = formData.get('altText') as string
    const postId = formData.get('postId') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate form data (postId is now optional)
    const validatedData = mediaUploadSchema.parse({ altText, postId })

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { 
          error: 'Invalid file type', 
          allowedTypes: ALLOWED_TYPES 
        },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { 
          error: 'File too large', 
          maxSize: `${MAX_FILE_SIZE / (1024 * 1024)}MB` 
        },
        { status: 400 }
      )
    }

    // Check if post exists (only if postId provided)
    if (validatedData.postId) {
      const post = await prisma.post.findUnique({
        where: { id: validatedData.postId },
      })

      if (!post) {
        return NextResponse.json(
          { error: 'Post not found' },
          { status: 404 }
        )
      }
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()
    const filename = `${uuidv4()}.${fileExtension}`
    const objectName = `uploads/${filename}`

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Upload to MinIO
    await minioClient.putObject(bucketName, objectName, buffer, file.size, {
      'Content-Type': file.type,
    })

    // Generate public URL
    const url = `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${bucketName}/${objectName}`

    // Save metadata to database
    const media = await prisma.media.create({
      data: {
        filename,
        originalName: file.name,
        url,
        altText: validatedData.altText || file.name,
        mimeType: file.type,
        size: file.size,
        postId: validatedData.postId || null,
        uploadedById: '1' // TODO: Get from JWT token/auth
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(media, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }
    
    console.error('Error uploading media:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
