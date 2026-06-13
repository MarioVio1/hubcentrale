import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const channel = await db.channel.findUnique({
      where: { id: params.id },
      include: { category: true }
    })
    if (!channel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 })
    }
    return NextResponse.json(channel)
  } catch (error) {
    console.error('Error fetching channel:', error)
    return NextResponse.json({ error: 'Failed to fetch channel' }, { status: 500 })
  }
}
