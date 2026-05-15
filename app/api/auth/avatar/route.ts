import { put, del } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';
import { getSessionCustomer } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Check if BLOB token is configured
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('[Avatar API] BLOB_READ_WRITE_TOKEN not configured');
      return NextResponse.json(
        { error: 'Avatar upload not configured on server' },
        { status: 500 }
      );
    }

    const customer = await getSessionCustomer();

    if (!customer) {
      console.warn('[Avatar API] Unauthorized - no session customer');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log(`[Avatar API] Processing upload for customer ${customer.id}`);

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      console.warn('[Avatar API] No file provided');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.warn(`[Avatar API] Invalid file type: ${file.type}`);
      return NextResponse.json(
        { error: 'Only image files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.warn(`[Avatar API] File too large: ${file.size} bytes`);
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Create unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `avatars/customer_${customer.id}_${timestamp}.${extension}`;

    console.log(`[Avatar API] Uploading to Vercel Blob: ${filename}`);

    try {
      // Upload to Vercel Blob
      const blob = await put(filename, file, {
        access: 'public',
      });

      console.log(`[Avatar API] Blob uploaded successfully: ${blob.url}`);

      // Update customer avatar_url in database
      console.log(`[Avatar API] Updating database for customer ${customer.id}`);
      
      await sql`
        UPDATE customers
        SET avatar_url = ${blob.url}, updated_at = NOW()
        WHERE id = ${customer.id}
      `;

      console.log(`[Avatar API] Database updated successfully`);

      return NextResponse.json({
        success: true,
        avatar_url: blob.url,
        message: 'Avatar uploaded successfully',
      });
    } catch (blobError) {
      console.error('[Avatar API] Vercel Blob error:', blobError);
      throw blobError;
    }
  } catch (error) {
    console.error('[Avatar API] POST Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Failed to upload avatar',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('[Avatar API] BLOB_READ_WRITE_TOKEN not configured for DELETE');
      return NextResponse.json(
        { error: 'Avatar deletion not configured on server' },
        { status: 500 }
      );
    }

    const customer = await getSessionCustomer();

    if (!customer) {
      console.warn('[Avatar API DELETE] Unauthorized');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log(`[Avatar API DELETE] Processing for customer ${customer.id}`);

    // Get current avatar URL
    const result = await sql`
      SELECT avatar_url FROM customers WHERE id = ${customer.id}
    `;

    const customerData = result.rows?.[0];
    const avatarUrl = customerData?.avatar_url;

    console.log(`[Avatar API DELETE] Current avatar URL: ${avatarUrl ? 'exists' : 'null'}`);

    if (avatarUrl && (avatarUrl.includes('vercel-storage') || avatarUrl.includes('blob.vercel-storage'))) {
      try {
        console.log(`[Avatar API DELETE] Deleting blob: ${avatarUrl}`);
        // Delete from Vercel Blob
        await del(avatarUrl);
        console.log(`[Avatar API DELETE] Blob deleted successfully`);
      } catch (delError) {
        console.error('[Avatar API DELETE] Failed to delete blob:', delError);
        // Continue even if blob deletion fails
      }
    }

    // Clear avatar_url from database
    console.log(`[Avatar API DELETE] Clearing avatar_url from database`);
    await sql`
      UPDATE customers
      SET avatar_url = NULL, updated_at = NOW()
      WHERE id = ${customer.id}
    `;

    console.log(`[Avatar API DELETE] Database updated successfully`);

    return NextResponse.json({
      success: true,
      message: 'Avatar deleted successfully',
    });
  } catch (error) {
    console.error('[Avatar API DELETE] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Failed to delete avatar',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}
