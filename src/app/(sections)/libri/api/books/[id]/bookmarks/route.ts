import { NextRequest, NextResponse } from 'next/server'
import { db } from '@libri/lib/db'

// GET /api/books/[id]/bookmarks - Get all bookmarks
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookmarks = await db.bookmark.findMany({
      where: { bookId: params.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ success: true, bookmarks })
  } catch (error) {
    console.error('Error fetching bookmarks:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bookmarks' },
      { status: 500 }
    )
  }
}

// POST /api/books/[id]/bookmarks - Create bookmark
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { title, cfi, pageNumber, note } = body

    const bookmark = await db.bookmark.create({
      data: {
        bookId: params.id,
        title: title || 'Untitled Bookmark',
        cfi,
        pageNumber,
        note
      }
    })

    return NextResponse.json({ success: true, bookmark })
  } catch (error) {
    console.error('Error creating bookmark:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create bookmark' },
      { status: 500 }
    )
  }
}

// DELETE /api/books/[id]/bookmarks - Delete bookmark
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams
    const bookmarkId = searchParams.get('id')

    if (!bookmarkId) {
      return NextResponse.json(
        { success: false, error: 'Bookmark ID required' },
        { status: 400 }
      )
    }

    await db.bookmark.delete({
      where: { id: bookmarkId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting bookmark:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete bookmark' },
      { status: 500 }
    )
  }
}
