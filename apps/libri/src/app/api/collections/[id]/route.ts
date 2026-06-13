import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * API per aggiornare una collection
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, description, color } = body;

    const collection = await db.collection.update({
      where: { id: params.id },
      data: {
        name,
        description,
        color
      }
    });

    return NextResponse.json({
      success: true,
      collection
    });
  } catch (error) {
    console.error('Error updating collection:', error);
    return NextResponse.json(
      {
        error: 'Failed to update collection',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * API per eliminare una collection
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.collection.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      success: true,
      message: 'Collection deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting collection:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete collection',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
