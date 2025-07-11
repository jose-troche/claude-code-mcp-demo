"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface FileUploadProps {
  onImageUpload: (imageData: string) => void;
  maxFileSizeMB?: number;
  className?: string;
}

const FileUpload = ({ 
  onImageUpload, 
  maxFileSizeMB = 5,
  className 
}: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const compressImage = (file: File, maxWidth = 1200): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Convert to JPEG with quality 0.8 for better compression
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          resolve(dataUrl);
        };
        
        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
    });
  };

  const handleFile = async (file: File) => {
    setError(null);
    
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (PNG, JPG, GIF)');
      return;
    }
    
    // Check file size
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > maxFileSizeMB) {
      setError(`File size exceeds ${maxFileSizeMB}MB limit`);
      return;
    }
    
    try {
      setIsUploading(true);
      
      // Simulated progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 10;
          return newProgress < 90 ? newProgress : prev;
        });
      }, 100);
      
      // Compress the image
      const compressedImage = await compressImage(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Update preview
      setPreview(compressedImage);
      
      // Pass the image data to parent component
      onImageUpload(compressedImage);
      
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    } catch (err) {
      setError('Error processing image');
      setIsUploading(false);
      console.error('Image upload error:', err);
    }
  };

  const clearPreview = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn("w-full", className)}>
      {preview ? (
        <div className="relative">
          <div className="relative h-40 w-full border border-slate-200 rounded-md overflow-hidden">
            {/* Use img tag instead of Next.js Image for dynamic content */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full h-full object-contain"
            />
          </div>
          <Button
            size="icon"
            variant="secondary"
            className="absolute top-1 right-1 h-6 w-6 rounded-full bg-white/80 hover:bg-white"
            onClick={clearPreview}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-md p-4 flex flex-col items-center justify-center cursor-pointer transition-colors",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-slate-200 hover:border-primary/50 hover:bg-slate-50",
            isUploading && "pointer-events-none opacity-70"
          )}
        >
          {isUploading ? (
            <div className="w-full">
              <div className="text-center mb-1 text-sm text-slate-500">
                Uploading... {uploadProgress}%
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div 
                  className="bg-primary h-1.5 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }} 
                />
              </div>
            </div>
          ) : (
            <>
              <ImageIcon className="h-8 w-8 mb-2 text-slate-400" />
              <div className="text-sm font-medium">
                Drop image here or click to upload
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Support: PNG, JPG, GIF (max {maxFileSizeMB}MB)
              </p>
            </>
          )}
          
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/png,image/jpeg,image/gif"
            onChange={handleFileChange}
          />
        </div>
      )}
      
      {error && (
        <div className="text-sm text-red-500 mt-1">{error}</div>
      )}
    </div>
  );
};

export default FileUpload;