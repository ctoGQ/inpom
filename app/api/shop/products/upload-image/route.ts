import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';
import { getSessionCustomer } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Check if BLOB token is configured
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('[Product Image Upload API] BLOB_READ_WRITE_TOKEN not configured');
      return NextResponse.json(
        { error: 'Image upload not configured on server' },
        { status: 500 }
      );
    }

    const customer = await getSessionCustomer();
    if (!customer) {
      console.warn('[Product Image Upload API] Unauthorized');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log(`[Product Image Upload API] Processing upload for seller ${customer.id}`);

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const productId = formData.get('productId') as string;

    if (!file) {
      console.warn('[Product Image Upload API] No file provided');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.warn(`[Product Image Upload API] Invalid file type: ${file.type}`);
      return NextResponse.json(
        { error: 'Only image files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB for products)
    if (file.size > 10 * 1024 * 1024) {
      console.warn(`[Product Image Upload API] File too large: ${file.size} bytes`);
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    // Create unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `products/seller_${customer.id}/${productId || 'temp'}_${timestamp}.${extension}`;

    console.log(`[Product Image Upload API] Uploading to Vercel Blob: ${filename}`);

    try {
      // Upload to Vercel Blob
      const blob = await put(filename, file, {
        access: 'public',
      });

      console.log(`[Product Image Upload API] Blob uploaded successfully: ${blob.url}`);

      return NextResponse.json({
        success: true,
        imageUrl: blob.url,
        message: 'Image uploaded successfully',
      });
    } catch (blobError) {
      console.error('[Product Image Upload API] Vercel Blob error:', blobError);
      throw blobError;
    }
  } catch (error) {
    console.error('[Product Image Upload API] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        error: 'Failed to upload image',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}
