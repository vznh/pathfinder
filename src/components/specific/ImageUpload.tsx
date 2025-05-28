import React, { useCallback, useState } from 'react';
import { createClient } from '@/supabase/component';
import { useDropzone } from 'react-dropzone';
import { Loader2 } from 'lucide-react';

interface ImageUploadProps {
  onUploadComplete: (urls: string[]) => void;
  maxFiles?: number;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onUploadComplete, maxFiles = 5 }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const supabase = createClient();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    setUploading(true);
    setUploadProgress(0);
    const urls: string[] = [];

    try {
      for (let i = 0; i < acceptedFiles.length; i++) {
        const file = acceptedFiles[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { data, error } = await supabase.storage
          .from('event-images')
          .upload(filePath, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('event-images')
          .getPublicUrl(filePath);

        urls.push(publicUrl);
        setUploadProgress(((i + 1) / acceptedFiles.length) * 100);
      }

      onUploadComplete(urls);
    } catch (error) {
      console.error('Error uploading images:', error);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [supabase, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxFiles,
    disabled: uploading
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
        ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <input {...getInputProps()} />
      {uploading ? (
        <div className="space-y-2">
          <div className="flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
          </div>
          <p className="text-sm text-gray-500">Uploading... {Math.round(uploadProgress)}%</p>
        </div>
      ) : isDragActive ? (
        <p>Drop the images here...</p>
      ) : (
        <p>Drag & drop images here, or click to select files</p>
      )}
      <p className="text-sm text-gray-500 mt-2">
        Supported formats: JPG, JPEG, PNG (max {maxFiles} files)
      </p>
    </div>
  );
};

export default ImageUpload; 