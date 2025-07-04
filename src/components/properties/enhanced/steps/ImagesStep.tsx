
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Upload, X, Eye, MoveUp, MoveDown } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ImageFile {
  id: string;
  file?: File;
  url: string;
  preview: string;
  alt_text?: string;
  display_order: number;
}

interface ImagesStepProps {
  data: {
    images: ImageFile[];
  };
  onUpdate: (data: { images: ImageFile[] }) => void;
  propertyId?: string;
}

const ImagesStep = ({ data, onUpdate, propertyId }: ImagesStepProps) => {
  const [images, setImages] = useState<ImageFile[]>(data.images || []);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newImages = acceptedFiles.map((file, index) => ({
      id: Date.now().toString() + index,
      file,
      url: '',
      preview: URL.createObjectURL(file),
      alt_text: '',
      display_order: images.length + index
    }));

    const updatedImages = [...images, ...newImages];
    setImages(updatedImages);
    onUpdate({ images: updatedImages });
  }, [images, onUpdate]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    onDropRejected: (rejectedFiles) => {
      rejectedFiles.forEach((file) => {
        file.errors.forEach((error) => {
          if (error.code === 'file-too-large') {
            toast.error(`File ${file.file.name} is too large. Maximum size is 5MB.`);
          } else if (error.code === 'file-invalid-type') {
            toast.error(`File ${file.file.name} has an invalid type. Only images are allowed.`);
          }
        });
      });
    }
  });

  const uploadImages = async () => {
    if (!propertyId) {
      toast.error('Property ID is required for image upload');
      return;
    }

    setUploading(true);
    try {
      const uploadPromises = images
        .filter(img => img.file && !img.url)
        .map(async (img) => {
          const fileName = `${propertyId}/${Date.now()}-${img.file!.name}`;
          const { data, error } = await supabase.storage
            .from('property-images')
            .upload(fileName, img.file!);

          if (error) throw error;

          const { data: { publicUrl } } = supabase.storage
            .from('property-images')
            .getPublicUrl(fileName);

          return { ...img, url: publicUrl };
        });

      const uploadedImages = await Promise.all(uploadPromises);
      
      // Update images with uploaded URLs
      const updatedImages = images.map(img => {
        const uploaded = uploadedImages.find(u => u.id === img.id);
        return uploaded || img;
      });

      setImages(updatedImages);
      onUpdate({ images: updatedImages });
      toast.success('Images uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (id: string) => {
    const updatedImages = images
      .filter(img => img.id !== id)
      .map((img, index) => ({ ...img, display_order: index }));
    
    setImages(updatedImages);
    onUpdate({ images: updatedImages });
  };

  const moveImage = (id: string, direction: 'up' | 'down') => {
    const currentIndex = images.findIndex(img => img.id === id);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= images.length) return;

    const updatedImages = [...images];
    [updatedImages[currentIndex], updatedImages[newIndex]] = 
    [updatedImages[newIndex], updatedImages[currentIndex]];

    // Update display orders
    updatedImages.forEach((img, index) => {
      img.display_order = index;
    });

    setImages(updatedImages);
    onUpdate({ images: updatedImages });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Property Images</h2>
        <p className="text-gray-600">Upload high-quality images of your property to attract potential tenants.</p>
      </div>

      {/* Upload Area */}
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-green-400 bg-green-50' 
                : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            {isDragActive ? (
              <p className="text-green-600">Drop the images here...</p>
            ) : (
              <div>
                <p className="text-gray-600 mb-2">Drag & drop images here, or click to select</p>
                <p className="text-sm text-gray-500">Supports: JPEG, PNG, WebP, GIF (max 5MB each)</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Label className="text-lg font-semibold">Uploaded Images ({images.length})</Label>
              {propertyId && images.some(img => img.file && !img.url) && (
                <Button
                  onClick={uploadImages}
                  disabled={uploading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {uploading ? 'Uploading...' : 'Upload Images'}
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((image, index) => (
                <Card key={image.id} className="overflow-hidden">
                  <div className="relative">
                    <img
                      src={image.preview || image.url}
                      alt={image.alt_text || `Property image ${index + 1}`}
                      className="w-full h-48 object-cover"
                    />
                    {index === 0 && (
                      <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
                        Main Image
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => moveImage(image.id, 'up')}
                        disabled={index === 0}
                        className="h-8 w-8 p-0"
                      >
                        <MoveUp className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => moveImage(image.id, 'down')}
                        disabled={index === images.length - 1}
                        className="h-8 w-8 p-0"
                      >
                        <MoveDown className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeImage(image.id)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Order: {index + 1}</span>
                      {image.url ? (
                        <span className="text-green-600 flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          Uploaded
                        </span>
                      ) : (
                        <span className="text-orange-600">Pending upload</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Tip:</strong> The first image will be used as the main property image. 
                Use the arrow buttons to reorder images.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ImagesStep;
