import { put, del } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';
import { getSessionCustomer } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const customer = await getSessionCustomer();

    if (!customer) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Create unique filename
    const timestamp = Date.now();
    const filename = `avatars/customer_${customer.id}_${timestamp}.${file.name.split('.').pop()}`;

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
    });

    // Update customer avatar_url in database
    await sql`
      UPDATE customers
      SET avatar_url = ${blob.url}, updated_at = NOW()
      WHERE id = ${customer.id}
    `;

    return NextResponse.json({
      success: true,
      avatar_url: blob.url,
      message: 'Avatar uploaded successfully',
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    return NextResponse.json(
      { error: 'Failed to upload avatar' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const customer = await getSessionCustomer();

    if (!customer) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get current avatar URL
    const result = await sql`
      SELECT avatar_url FROM customers WHERE id = ${customer.id}
    `;

    const customerData = result.rows?.[0];
    const avatarUrl = customerData?.avatar_url;

    if (avatarUrl && avatarUrl.includes('vercel-storage')) {
      // Delete from Vercel Blob
      await del(avatarUrl);
    }

    // Clear avatar_url from database
    await sql`
      UPDATE customers
      SET avatar_url = NULL, updated_at = NOW()
      WHERE id = ${customer.id}
    `;

    return NextResponse.json({
      success: true,
      message: 'Avatar deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting avatar:', error);
    return NextResponse.json(
      { error: 'Failed to delete avatar' },
      { status: 500 }
    );
  }
}
