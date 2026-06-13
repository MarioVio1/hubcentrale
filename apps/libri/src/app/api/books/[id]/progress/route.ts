import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/books/[id]/progress - Get reading progress
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const progress = await db.readingProgress.findFirst({
      where: {
        bookId: params.id,
        userId: null // Anonymous user for now
      }
    })

    return NextResponse.json({ success: true, progress })
  } catch (error) {
    console.error('Error fetching progress:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch progress' },
      { status: 500 }
    )
  }
}

// POST /api/books/[id]/progress - Save reading progress
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { currentPage, totalPages, percentage, cfi, lastPosition } = body

    // Upsert progress
    const progress = await db.readingProgress.upsert({
      where: {
        bookId_userId: {
          bookId: params.id,
          userId: null
        }
      },
      update: {
        currentPage,
        totalPages,
        percentage,
        cfi,
        lastPosition: JSON.stringify(lastPosition),
        lastReadAt: new Date()
      },
      create: {
        bookId: params.id,
        userId: null,
        currentPage: currentPage || 0,
        totalPages,
        percentage: percentage || 0,
        cfi,
        lastPosition: JSON.stringify(lastPosition),
        lastReadAt: new Date()
      }
    })

    // Update book category based on progress
    if (percentage >= 100) {
      await db.book.update({
        where: { id: params.id },
        data: { category: 'completed' }
      })
    } else if (percentage > 0 && percentage < 100) {
      await db.book.update({
        where: { id: params.id },
        data: { category: 'reading' }
      })
    }

    return NextResponse.json({ success: true, progress })
  } catch (error) {
    console.error('Error saving progress:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save progress' },
      { status: 500 }
    )
  }
}
