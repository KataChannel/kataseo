import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { 
  slugify, 
  generateUniqueSlug, 
  validatePostData, 
  generateMetaTitle, 
  generateMetaDescription 
} from '@/lib/utils/slugify'

// Schema for creating/updating posts
const postSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  content: z.any(), // JSON content
  metaTitle: z.string().max(60, 'Meta title must be less than 60 characters').optional(),
  metaDescription: z.string().max(160, 'Meta description must be less than 160 characters').optional(),
  slug: z.string().optional(),
  excerpt: z.string().max(300, 'Excerpt must be less than 300 characters').optional(),
  featuredImage: z.string().url('Invalid image URL').optional(),
  categoryId: z.string().optional(),
  isPublished: z.boolean().default(false),
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
    
    // Validate input data with enhanced validation
    const validation = validatePostData(body)
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validation.error.issues 
        },
        { status: 400 }
      )
    }
    
    const { title, content, metaTitle, metaDescription, slug, ...rest } = validation.data
    
    // Get author ID from request (you'll need to implement auth middleware)
    const authorId = request.headers.get('x-user-id') || '1' // Temporary fallback
    
    // Generate slug from title if not provided
    let finalSlug = slug || slugify(title)
    
    // Check if slug already exists and make it unique
    const existingSlugs = await prisma.post.findMany({
      select: { slug: true }
    }).then(posts => posts.map(p => p.slug))
    
    finalSlug = generateUniqueSlug(finalSlug, existingSlugs)
    
    // Generate SEO metadata
    const finalMetaTitle = generateMetaTitle(title, metaTitle)
    const finalMetaDescription = generateMetaDescription(content || [], metaDescription)
    
    const post = await prisma.post.create({
      data: {
        title,
        slug: finalSlug,
        content: content || [],
        metaTitle: finalMetaTitle,
        metaDescription: finalMetaDescription,
        status: rest.isPublished ? 'PUBLISHED' : 'DRAFT',
        authorId,
        ...(rest.categoryId && {
          categories: {
            connect: { id: rest.categoryId }
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
