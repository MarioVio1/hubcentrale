import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/books/[id]/highlights - Get all highlights
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const highlights = await db.highlight.findMany({
      where: { bookId: params.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ success: true, highlights })
  } catch (error) {
    console.error('Error fetching highlights:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch highlights' },
      { status: 500 }
    )
  }
}

// POST /api/books/[id]/highlights - Create highlight
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { text, cfi, color, note } = body

    const highlight = await db.highlight.create({
      data: {
        bookId: params.id,
        text,
        cfi,
        color: color || '#ffff00',
        note
      }
    })

    return NextResponse.json({ success: true, highlight })
  } catch (error) {
    console.error('Error creating highlight:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create highlight' },
      { status: 500 }
    )
  }
}

// DELETE /api/books/[id]/highlights - Delete highlight
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams
    const highlightId = searchParams.get('id')

    if (!highlightId) {
      return NextResponse.json(
        { success: false, error: 'Highlight ID required' },
        { status: 400 }
      )
    }

    await db.highlight.delete({
      where: { id: highlightId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting highlight:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete highlight' },
      { status: 500 }
    )
  }
}
