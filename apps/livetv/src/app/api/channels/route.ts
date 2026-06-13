import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {}
    if (categoryId) where.categoryId = categoryId
    if (search) {
      where.title = { contains: search, mode: 'insensitive' }
    }

    const [channels, total] = await Promise.all([
      db.channel.findMany({
        where,
        include: { category: true },
        orderBy: { title: 'asc' },
        take: limit,
        skip: offset
      }),
      db.channel.count({ where })
    ])

    return NextResponse.json({ channels, total, limit, offset })
  } catch (error) {
    console.error('Error fetching channels:', error)
    return NextResponse.json({ error: 'Failed to fetch channels' }, { status: 500 })
  }
}
