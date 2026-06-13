import { NextRequest, NextResponse } from 'next/server';
import { db } from '@manga/lib/db';

// GET all repositories
export async function GET() {
  try {
    const repos = await db.repo.findMany({
      include: {
        extensions: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(repos);
  } catch (error) {
    console.error('Error fetching repos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch repositories' },
      { status: 500 }
    );
  }
}

// POST add new repository
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, url, description, icon } = body;

    if (!name || !url) {
      return NextResponse.json(
        { error: 'Name and URL are required' },
        { status: 400 }
      );
    }

    // Check if repo already exists
    const existing = await db.repo.findUnique({
      where: { url },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Repository already exists' },
        { status: 400 }
      );
    }

    const repo = await db.repo.create({
      data: {
        name,
        url,
        description,
        icon,
        enabled: true,
      },
    });

    return NextResponse.json(repo);
  } catch (error) {
    console.error('Error creating repo:', error);
    return NextResponse.json(
      { error: 'Failed to create repository' },
      { status: 500 }
    );
  }
}
