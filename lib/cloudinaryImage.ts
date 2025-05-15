interface UploadOptions {
  folder?: string;
  tags?: string[];
  transformation?: {
    width?: number;
    height?: number;
    crop?: 'fill' | 'fit' | 'limit' | 'pad' | 'scale';
    quality?: 'auto' | number;
  };
  onProgress?: (progress: number) => void;
}

export async function uploadImage(
  file: File,
  options: UploadOptions = {}
): Promise<{ url: string; publicId: string }> {
  const url = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'user_uploads');

  // Add optional parameters
  if (options.folder) formData.append('folder', options.folder);
  if (options.tags) formData.append('tags', options.tags.join(','));
  
  if (options.transformation) {
    const transformationParams = [];
    const { width, height, crop, quality } = options.transformation;
    
    if (width) transformationParams.push(`w_${width}`);
    if (height) transformationParams.push(`h_${height}`);
    if (crop) transformationParams.push(`c_${crop}`);
    if (quality) transformationParams.push(`q_${quality}`);
    
    if (transformationParams.length > 0) {
      formData.append('transformation', transformationParams.join(','));
    }
  }

  try {
    const xhr = new XMLHttpRequest();
    
    // Set up progress tracking if callback provided
    if (options.onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = event.loaded / event.total;
          options.onProgress?.(progress);
        }
      };
    }

    const response = await new Promise<XMLHttpRequest>((resolve, reject) => {
      xhr.open('POST', url);
      xhr.onload = () => resolve(xhr);
      xhr.onerror = () => reject(new Error('Upload failed'));
      xhr.send(formData);
    });

    if (response.status !== 200) {
      const errorData = JSON.parse(response.responseText);
      throw new Error(errorData.error?.message || 'Image upload failed');
    }

    const data = JSON.parse(response.responseText);
    return {
      url: data.secure_url,
      publicId: data.public_id
    };
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to upload image'
    );
  }
} 