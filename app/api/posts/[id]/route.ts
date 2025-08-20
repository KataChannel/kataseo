import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { z } from 'zod'

// Schema for updating posts
const updatePostSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  content: z.any().optional(), // JSON content
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
  categoryIds: z.array(z.string()).optional(),
  tagIds: z.array(z.string()).optional(),
})

// GET /api/posts/[id] - Get single post by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const post = await prisma.post.findUnique({
      where: { id },
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

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/posts/[id] - Update post by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = updatePostSchema.parse(body)

    // Check if post exists
    const existingPost = await prisma.post.findUnique({
      where: { id },
    })

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Generate new slug if title is being updated
    const updateData: Prisma.PostUpdateInput = {}
    
    // Copy basic fields
    if (validatedData.title) updateData.title = validatedData.title
    if (validatedData.content) updateData.content = validatedData.content
    if (validatedData.metaTitle !== undefined) updateData.metaTitle = validatedData.metaTitle
    if (validatedData.metaDescription !== undefined) updateData.metaDescription = validatedData.metaDescription
    if (validatedData.status) updateData.status = validatedData.status
    
    if (validatedData.title) {
      const slug = validatedData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim()
      updateData.slug = `${slug}-${Date.now()}`
    }

    // Handle category and tag updates
    if (validatedData.categoryIds !== undefined) {
      updateData.categories = {
        set: validatedData.categoryIds.map(id => ({ id }))
      }
    }

    if (validatedData.tagIds !== undefined) {
      updateData.tags = {
        set: validatedData.tagIds.map(id => ({ id }))
      }
    }

    const post = await prisma.post.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json(post)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }
    
    console.error('Error updating post:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/posts/[id] - Delete post by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const hardDelete = searchParams.get('hard') === 'true'

    // Check if post exists
    const existingPost = await prisma.post.findUnique({
      where: { id },
    })

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    if (hardDelete) {
      // Hard delete - permanently remove from database
      await prisma.post.delete({
        where: { id },
      })
    } else {
      // Soft delete - just update status to indicate deletion
      await prisma.post.update({
        where: { id },
        data: {
          status: 'DRAFT', // You might want to add a DELETED status to the enum
        },
      })
    }

    return NextResponse.json(
      { message: hardDelete ? 'Post permanently deleted' : 'Post deleted' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
