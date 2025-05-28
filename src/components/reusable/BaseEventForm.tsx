import React, { useState, useCallback } from "react";
import { createClient } from "@/supabase/component";
import { Upload, X } from "lucide-react";

export interface BaseEventFormProps {
  formData: {
    name: string;
    tags: string;
    description: string;
    date: string;
    startTime: string;
    endTime: string;
    image_url: string | null;
  };
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  tagsInput: React.ReactNode;
}

const BaseEventForm: React.FC<BaseEventFormProps> = ({
  formData,
  onChange,
  onSubmit,
  onCancel,
  tagsInput,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelection(file);
    }
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  }, []);

  const handleFileSelection = (file: File) => {
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const removeImage = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedFile) {
      const supabase = createClient();
      try {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const { data, error } = await supabase.storage
          .from('event-images')
          .upload(fileName, selectedFile);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('event-images')
          .getPublicUrl(fileName);

        // Update form data with the uploaded image URL
        const event = new Event('change');
        const target = document.createElement('input');
        target.name = 'image_url';
        target.value = publicUrl;
        Object.defineProperty(event, 'target', { value: target });
        onChange(event as any);
      } catch (error) {
        console.error('Error uploading image:', error);
        return;
      }
    }
    
    onSubmit(e);
  };

  return (
    <div className="absolute left-[calc(50%+20px)] top-1/2 -translate-y-1/2">
      <div className="relative bg-gray-800 text-white rounded-2xl shadow-2xl p-6 w-96">
        <button onClick={onCancel} className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl">×</button>
        <div className="mb-2 text-2xl font-bold">Create Event</div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={onChange}
              required
              className="w-full px-3 py-2 rounded bg-gray-700 text-white focus:outline-none"
            />
          </div>

          {tagsInput}

          <div>
            <label className="block text-sm mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={onChange}
              rows={2}
              className="w-full px-3 py-2 rounded bg-gray-700 text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Image</label>
            <div
              className={`border-2 border-dashed rounded-lg p-4 text-center ${
                isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="w-8 h-8 mb-2" />
                <span className="text-sm">
                  Drag & drop an image here or click to upload
                </span>
              </label>
            </div>

            {/* Image Preview */}
            {previewUrl && (
              <div className="mt-4 relative inline-block">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-24 h-24 object-cover rounded"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <div className="w-[33%]">
              <label className="block text-sm mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={onChange}
                required
                className="w-full px-1 py-2 rounded bg-gray-700 text-white focus:outline-none"
              />
            </div>
            <div className="w-[33%]">
              <label className="block text-sm mb-1">Start Time</label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={onChange}
                required
                className="w-full px-1 py-2 rounded bg-gray-700 text-white focus:outline-none"
              />
            </div>
            <div className="w-[33%]">
              <label className="block text-sm mb-1">End Time</label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={onChange}
                required
                className="w-full px-1 py-2 rounded bg-gray-700 text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BaseEventForm;
