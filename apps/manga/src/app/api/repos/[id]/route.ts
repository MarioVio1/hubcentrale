import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// DELETE repository
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.repo.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting repo:', error);
    return NextResponse.json(
      { error: 'Failed to delete repository' },
      { status: 500 }
    );
  }
}

// PATCH toggle repository enabled status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { enabled } = body;

    const repo = await db.repo.update({
      where: { id: params.id },
      data: { enabled },
    });

    return NextResponse.json(repo);
  } catch (error) {
    console.error('Error updating repo:', error);
    return NextResponse.json(
      { error: 'Failed to update repository' },
      { status: 500 }
    );
  }
}
