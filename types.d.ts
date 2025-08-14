interface Video {
    id: string;
    title: string;
    description: string;
    publicId: string;
    originSize: number;
    compressedSize: number;
    duration: number;
    createdAt: Date;
    updatedAt: Date;
}

interface CloudinaryUploadResult {
    public_id: string;
    asset_id: string;
    bytes: number;
    duration?: number;
    created_at: string;
    [key: string]: any;
}

interface VideoCardProps {
    video: Video;
    onDownload: (url: string, title: string) => void;
}