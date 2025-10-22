import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// Temporary storage for chunks (in production, use Redis or similar)
const chunkStorage = new Map<string, { chunks: Buffer[], totalChunks: number, fileName: string }>();

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const chunk = formData.get('chunk') as File;
    const chunkIndex = parseInt(formData.get('chunkIndex') as string);
    const totalChunks = parseInt(formData.get('totalChunks') as string);
    const fileId = formData.get('fileId') as string;
    const fileName = formData.get('fileName') as string;
    const entityId = formData.get('entityId') as string;
    const entityType = formData.get('entityType') as string;

    if (!chunk || isNaN(chunkIndex) || isNaN(totalChunks) || !fileId || !fileName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Convert chunk to buffer
    const chunkBuffer = Buffer.from(await chunk.arrayBuffer());

    // Initialize storage for this file if not exists
    if (!chunkStorage.has(fileId)) {
      chunkStorage.set(fileId, {
        chunks: new Array(totalChunks),
        totalChunks,
        fileName,
      });
    }

    const fileData = chunkStorage.get(fileId)!;
    fileData.chunks[chunkIndex] = chunkBuffer;

    // Check if all chunks are received
    const receivedChunks = fileData.chunks.filter(Boolean).length;
    
    return NextResponse.json({
      success: true,
      chunkIndex,
      receivedChunks,
      totalChunks,
      isComplete: receivedChunks === totalChunks,
    });

  } catch (error) {
    console.error('Chunk upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process chunk' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}