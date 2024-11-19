import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Configuration
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
    // todo check  user
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ message: 'Un-authorize User' }, { status: 401 });

    try {
        if (
            !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
            !process.env.CLOUDINARY_API_KEY ||
            !process.env.CLOUDINARY_API_SECRET
        ) {
            return NextResponse.json(
                { message: 'Cloudinary credentials not found' },
                { status: 404 }
            );
        }
        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        const title = formData.get('title') as string;
        const description = formData.get('description') as string;
        const originalSize = formData.get('originalSize') as string;

        if (!file) {
            return NextResponse.json({ message: 'File not found' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: 'video',
                    folder: 'video-uploads',
                    transformation: [{ quality: 'auto', fetch_formate: 'mp4' }],
                },
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result as CloudinaryUploadResult);
                }
            );
            uploadStream.end(buffer);
        });

        const video = await prisma.video.create({
            data: {
                title,
                description,
                publicId: result.public_id,
                originSize: originalSize,
                compressedSize: String(result.bytes),
                duration: result.duration || 0,
            },
        });

        if (!video) return NextResponse.json({ message: 'UPload video failed' }, { status: 404 });

        return NextResponse.json(video);
    } catch (error) {
        console.log('UPload video failed', error);
        return NextResponse.json({ message: 'UPload video failed' }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}