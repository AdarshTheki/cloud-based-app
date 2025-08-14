'use client';

import dayjs from 'dayjs';
import { filesize } from 'filesize';
import { Download } from 'lucide-react';
import { getCldImageUrl } from 'next-cloudinary';
import React, { useCallback } from 'react';
import Image from 'next/image';

const ImageCard: React.FC<CloudinaryUploadResult> = ({ ...rest }) => {
  const getThumbnailUrl = useCallback((publicId: string) => {
    return getCldImageUrl({
      src: publicId,
      width: 400,
      height: 225,
      crop: 'fill',
      gravity: 'auto',
      format: 'jpg',
      quality: 'auto',
    });
  }, []);

  const formatSize = useCallback((size: number) => {
    return filesize(size);
  }, []);

  const handleDownload = () => {
    const imageUrl = getThumbnailUrl(rest.public_id);
    fetch(imageUrl)
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `image.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      });
  };

  return (
    <div className='card bg-neutral-800 shadow-xl hover:shadow-2xl transition-all duration-300'>
      <figure>
        <Image
          src={getThumbnailUrl(rest.public_id)}
          alt={rest.public_id}
          width={400}
          height={225}
        />
      </figure>
      <div className='card-body p-4'>
        <p className='text-sm text-base-content opacity-70 mb-4'>
          Uploaded {dayjs(rest.created_at).fromNow()}
        </p>
        <div className='flex justify-between items-center mt-4'>
          <div className='text-sm font-semibold'>
            Image size:
            <span className='text-accent'>{formatSize(Number(rest.bytes))}</span>
          </div>
          <button className='btn btn-primary btn-sm' onClick={handleDownload}>
            <Download size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCard;
