"use client";
import { useState } from 'react';
import { uploadImage } from '@/lib/cloudinary';
import { CldImage } from 'next-cloudinary';

export default function ImageUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadImage(file);
      setImageUrl(url);
      console.log('Uploaded image URL:', url);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        onChange={handleFileChange}
        accept="image/*"
        className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-violet-50 file:text-violet-700
          hover:file:bg-violet-100"
      />
      
      {isUploading && <p>Uploading...</p>}
      
      {imageUrl && (
        <div className="mt-4">
          <CldImage
            src={imageUrl}
            width="500"
            height="500"
            alt="Uploaded image"
            className="rounded-lg shadow-md"
          />
        </div>
      )}
    </div>
  );
} 