import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { minioClient, bucketName, ensureBucketExists } from '@/lib/minio'
import { z } from 'zod'

// Allowed file types and sizes
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/avi']
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES]
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

// Schema for media upload
const mediaSchema = z.object({
  altText: z.string().optional(),
  postId: z.string().min(1, 'Post ID is required'),
})

// POST /api/media - Upload file to MinIO
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

    // Validate form data
    const validatedData = mediaSchema.parse({ altText, postId })

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

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: validatedData.postId },
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split('.').pop()
    const fileName = `${timestamp}-${randomString}.${fileExtension}`
    const objectName = `uploads/${fileName}`

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Upload to MinIO
    await minioClient.putObject(bucketName, objectName, buffer, file.size, {
      'Content-Type': file.type,
    })

    // Generate public URL
    const url = `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${bucketName}/${objectName}`

    // Determine media type
    const mediaType = ALLOWED_IMAGE_TYPES.includes(file.type) ? 'image' : 'video'

    // Save metadata to database
    const media = await prisma.media.create({
      data: {
        url,
        altText: validatedData.altText || file.name,
        type: mediaType,
        size: file.size,
        postId: validatedData.postId,
      },
    })

    return NextResponse.json({
      id: media.id,
      url: media.url,
      altText: media.altText,
      type: media.type,
      size: media.size,
    }, { status: 201 })

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

// GET /api/media - Get media files
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('postId')
    const type = searchParams.get('type') // 'image' or 'video'

    const where: Prisma.MediaWhereInput = {}
    
    if (postId) {
      where.postId = postId
    }
    
    if (type) {
      where.type = type
    }

    const media = await prisma.media.findMany({
      where,
      orderBy: {
        id: 'desc'
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
