
import { UseFormReturn } from 'react-hook-form';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Upload, Image as ImageIcon, Star } from 'lucide-react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface MediaStepProps {
  form: UseFormReturn<any>;
}

const MediaStep = ({ form }: MediaStepProps) => {
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  
  const images = form.watch('images') || [];
  const thumbnailUrl = form.watch('thumbnail_url') || '';

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter(file => {
      const isValid = file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024; // 10MB limit
      if (!isValid) {
        console.warn(`File ${file.name} is not a valid image or is too large`);
      }
      return isValid;
    });

    if (validFiles.length > 0) {
      // For now, we'll just store the file names as strings
      // In a real implementation, you'd upload these to storage
      const fileUrls = validFiles.map(file => URL.createObjectURL(file));
      const currentImages = form.getValues('images') || [];
      form.setValue('images', [...currentImages, ...fileUrls]);
    }
  }, [form]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true,
  });

  const removeImage = (index: number) => {
    const currentImages = form.getValues('images') || [];
    const newImages = currentImages.filter((_, i) => i !== index);
    form.setValue('images', newImages);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Property Images
            </CardTitle>
            <Badge variant="outline" className="text-lg px-3 py-1">
              {images.length} Images
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Thumbnail URL Field */}
          <FormField
            control={form.control}
            name="thumbnail_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Thumbnail Image URL (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://example.com/image.jpg"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Thumbnail Preview */}
          {thumbnailUrl && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Thumbnail Preview:</p>
              <img
                src={thumbnailUrl}
                alt="Thumbnail preview"
                className="rounded-lg max-w-full h-auto max-h-48 object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Upload Area */}
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }
            `}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            {isDragActive ? (
              <p className="text-green-600 font-medium">Drop the images here...</p>
            ) : (
              <div>
                <p className="text-gray-600 mb-2">
                  <span className="font-medium">Click to upload</span> or drag and drop
                </p>
                <p className="text-sm text-gray-500">
                  PNG, JPG, WEBP up to 10MB each
                </p>
              </div>
            )}
          </div>

          {/* Image Grid */}
          {images.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Uploaded Images</h3>
                <p className="text-sm text-gray-600">
                  First image will be the main thumbnail
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((imageUrl, index) => (
                  <div
                    key={`${imageUrl}-${index}`}
                    className="relative group bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Thumbnail Badge */}
                    {index === 0 && (
                      <div className="absolute top-2 left-2 z-10">
                        <Badge className="bg-green-600 text-white flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          Main
                        </Badge>
                      </div>
                    )}

                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 z-10 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>

                    {/* Image Preview */}
                    <div className="aspect-square">
                      <img
                        src={imageUrl}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">📸 Photo Tips for Better Listings</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Take photos during the day with good natural lighting</li>
              <li>• Include exterior shots, common areas, and unit interiors</li>
              <li>• The first image will be used as the main thumbnail</li>
              <li>• High-quality photos attract more potential tenants</li>
              <li>• Include amenities like parking, pool, or gym if available</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MediaStep;
