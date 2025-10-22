import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import crypto from 'crypto';

// Import the chunk storage from the chunk route (in production, use shared storage)
const chunkStorage = new Map<string, { chunks: Buffer[], totalChunks: number, fileName: string }>();

export async function POST(request: NextRequest) {
  try {
    const { fileId, fileName, entityId, entityType } = await request.json();

    if (!fileId || !fileName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get chunks from storage
    const fileData = chunkStorage.get(fileId);
    if (!fileData) {
      return NextResponse.json(
        { error: 'File chunks not found' },
        { status: 404 }
      );
    }

    // Verify all chunks are present
    const missingChunks = fileData.chunks.findIndex(chunk => !chunk);
    if (missingChunks !== -1) {
      return NextResponse.json(
        { error: `Missing chunk at index ${missingChunks}` },
        { status: 400 }
      );
    }

    // Combine chunks
    const completeFile = Buffer.concat(fileData.chunks);

    // Generate secure filename
    const fileExtension = path.extname(fileName);
    const baseName = path.basename(fileName, fileExtension);
    const timestamp = Date.now();
    const hash = crypto.createHash('md5').update(completeFile).digest('hex').substring(0, 8);
    const secureFileName = `${baseName}_${timestamp}_${hash}${fileExtension}`;

    // Create upload directory structure
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const entityDir = entityType && entityId 
      ? path.join(uploadDir, entityType, entityId)
      : uploadDir;

    if (!existsSync(entityDir)) {
      await mkdir(entityDir, { recursive: true });
    }

    // Save file
    const filePath = path.join(entityDir, secureFileName);
    await writeFile(filePath, completeFile);

    // Generate public URL
    const publicUrl = entityType && entityId
      ? `/uploads/${entityType}/${entityId}/${secureFileName}`
      : `/uploads/${secureFileName}`;

    // Clean up chunk storage
    chunkStorage.delete(fileId);

    // In a real application, you would also:
    // 1. Save file metadata to database
    // 2. Run virus scanning
    // 3. Generate thumbnails for images
    // 4. Upload to cloud storage (S3, etc.)

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: secureFileName,
      originalName: fileName,
      size: completeFile.length,
      uploadedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Upload completion error:', error);
    return NextResponse.json(
      { error: 'Failed to complete upload' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}