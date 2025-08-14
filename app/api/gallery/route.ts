import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';

const prisma = new PrismaClient();

// Configuration
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface CloudinaryResource {
  public_id: string;
  secure_url: string;
  url: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  created_at: string;
}

interface ResourcesApiResponse {
  resources: CloudinaryResource[];
  next_cursor?: string;
}

export async function GET() {
  try {
    const videos = await prisma.video.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const images = await new Promise<ResourcesApiResponse>((resolve, reject) => {
      cloudinary.api.resources(
        {
          type: 'upload',
          prefix: 'cloud-based-images', // Specify the folder name
        },
        (err, result) => {
          if (err) reject(err); // Reject the promise on error
          resolve(result as ResourcesApiResponse); // Resolve with the resources array
        }
      );
    });

    return NextResponse.json({ videos: videos || [], images }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: 'Error fetching videos', error },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export const dynamic = 'force-dynamic';
