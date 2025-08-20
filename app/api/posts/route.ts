import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { z } from 'zod'

// Schema for creating/updating posts
const postSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.any(), // JSON content
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
  categoryIds: z.array(z.string()).optional(),
  tagIds: z.array(z.string()).optional(),
})

// GET /api/posts - Get all posts with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    // Build where clause
    const where: Prisma.PostWhereInput = {}
    
    if (category) {
      where.categories = {
        some: {
          slug: category
        }
      }
    }
    
    if (status) {
      where.status = status as 'DRAFT' | 'PUBLISHED'
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { metaTitle: { contains: search, mode: 'insensitive' } },
        { metaDescription: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get posts with relations
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              email: true,
              role: true
            }
          },
          categories: true,
          tags: true,
          media: true,
          _count: {
            select: {
              media: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit,
      }),
      prisma.post.count({ where }),
    ])

    return NextResponse.json({
      posts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/posts - Create new post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = postSchema.parse(body)
    
    // Get author ID from request (you'll need to implement auth middleware)
    const authorId = request.headers.get('x-user-id') || '1' // Temporary fallback
    
    // Generate slug from title
    const slug = validatedData.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim()

    const post = await prisma.post.create({
      data: {
        title: validatedData.title,
        slug: `${slug}-${Date.now()}`, // Add timestamp to ensure uniqueness
        content: validatedData.content,
        metaTitle: validatedData.metaTitle,
        metaDescription: validatedData.metaDescription,
        status: validatedData.status,
        authorId,
        ...(validatedData.categoryIds && {
          categories: {
            connect: validatedData.categoryIds.map(id => ({ id }))
          }
        }),
        ...(validatedData.tagIds && {
          tags: {
            connect: validatedData.tagIds.map(id => ({ id }))
          }
        })
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            role: true
          }
        },
        categories: true,
        tags: true,
        media: true,
      },
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }
    
    console.error('Error creating post:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
