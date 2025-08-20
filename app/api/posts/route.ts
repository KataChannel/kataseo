import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

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

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              email: true
            }
          },
          categories: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          },
          tags: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.post.count({ where })
    ])

    return NextResponse.json({
      posts,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        limit
      }
    })

  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

// POST /api/posts - Create a new post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const post = await prisma.post.create({
      data: {
        title: body.title,
        slug: body.slug || body.title.toLowerCase().replace(/\s+/g, '-'),
        content: body.content || [],
        metaTitle: body.metaTitle,
        metaDescription: body.metaDescription,
        status: body.status || 'DRAFT',
        authorId: '1', // TODO: Get from auth
        categories: body.categoryIds ? {
          connect: body.categoryIds.map((id: string) => ({ id }))
        } : undefined,
        tags: body.tagIds ? {
          connect: body.tagIds.map((id: string) => ({ id }))
        } : undefined
      },
      include: {
        author: {
          select: {
            id: true,
            email: true
          }
        },
        categories: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        tags: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    })

    return NextResponse.json(post, { status: 201 })

  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
}
