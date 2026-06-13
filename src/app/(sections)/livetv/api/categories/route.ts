import { db } from '@livetv/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const categories = await db.category.findMany({
      where: { isVisible: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { channels: true } }
      }
    })
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}
