import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { minioClient, bucketName } from '@/lib/minio'
import { z } from 'zod'

// Schema for media update
const mediaUpdateSchema = z.object({
  altText: z.string().optional(),
})

// GET /api/media/[id] - Get single media file
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const media = await prisma.media.findUnique({
      where: { id: params.id },
      include: {
        uploadedBy: {
          select: {
            id: true,
            email: true
          }
        }
      }
    })

    if (!media) {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(media)
  } catch (error) {
    console.error('Error fetching media:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/media/[id] - Update media metadata
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validatedData = mediaUpdateSchema.parse(body)

    const media = await prisma.media.findUnique({
      where: { id: params.id }
    })

    if (!media) {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404 }
      )
    }

    const updatedMedia = await prisma.media.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        uploadedBy: {
          select: {
            id: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(updatedMedia)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }
    
    console.error('Error updating media:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/media/[id] - Delete media file
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const media = await prisma.media.findUnique({
      where: { id: params.id }
    })

    if (!media) {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404 }
      )
    }

    // Extract object name from URL
    const urlParts = media.url.split('/')
    const objectName = urlParts.slice(-2).join('/') // e.g., "uploads/filename.jpg"

    try {
      // Delete from MinIO
      await minioClient.removeObject(bucketName, objectName)
    } catch (storageError) {
      console.error('Error deleting from storage:', storageError)
      // Continue with database deletion even if storage fails
    }

    // Delete from database
    await prisma.media.delete({
      where: { id: params.id }
    })

    return NextResponse.json(
      { message: 'Media deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting media:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
