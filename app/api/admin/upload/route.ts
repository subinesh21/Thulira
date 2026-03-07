import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { requireAdmin } from '@/lib/auth-middleware';

export const dynamic = 'force-dynamic';

// POST - Upload image (Admin only)
export async function POST(request: NextRequest) {
  // Require admin authentication
  const adminCheck = await requireAdmin(request);
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Invalid file type. Only JPEG, PNG, WEBP, and GIF are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // Sanitize filename — only allow alphanumerics, hyphens, underscores
    const timestamp = Date.now();
    const rawExtension = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    const extension = allowedExtensions.includes(rawExtension) ? rawExtension : 'jpg';
    const filename = `${timestamp}-${Math.random().toString(36).substring(2, 15)}.${extension}`;

    // Save to public/images directory
    const publicDir = path.join(process.cwd(), 'public', 'images');

    // Ensure directory exists
    try {
      await fs.access(publicDir);
    } catch {
      await fs.mkdir(publicDir, { recursive: true });
    }

    // Prevent path traversal by ensuring the resolved path stays within publicDir
    const filepath = path.resolve(publicDir, filename);
    if (!filepath.startsWith(publicDir)) {
      return NextResponse.json(
        { success: false, message: 'Invalid filename' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filepath, buffer);

    // Return the URL path
    const imageUrl = `/images/${filename}`;

    return NextResponse.json({
      success: true,
      message: 'Image uploaded successfully',
      imageUrl,
      filename
    });

  } catch (error: any) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to upload image',
      },
      { status: 500 }
    );
  }
}