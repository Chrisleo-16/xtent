
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, File, Trash2, CheckCircle } from 'lucide-react';

interface DocumentUploaderProps {
  documentType: string;
  documentName: { en: string; sw: string };
  onFileUpload: (file: File) => void;
  onFileDelete: () => void;
  isUploading: boolean;
  isDeleting: boolean;
  uploadedFile: { name: string } | null;
  lang: 'en' | 'sw';
}

const DocumentUploader = ({
  documentType,
  documentName,
  onFileUpload,
  onFileDelete,
  isUploading,
  isDeleting,
  uploadedFile,
  lang,
}: DocumentUploaderProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUploadClick = () => {
    if (selectedFile) {
      onFileUpload(selectedFile);
      setSelectedFile(null);
    }
  };
  
  const texts = {
    en: {
        selectFile: `Select ${documentName.en}`,
        upload: "Upload",
        delete: "Delete",
    },
    sw: {
        selectFile: `Chagua ${documentName.sw}`,
        upload: "Pakia",
        delete: "Futa",
    }
  }

  return (
    <div className="border p-4 rounded-lg space-y-3 bg-white shadow-sm">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">{documentName[lang]}</h3>
        {uploadedFile && <CheckCircle className="h-6 w-6 text-green-500" />}
      </div>
      
      {uploadedFile ? (
        <div className="flex items-center justify-between p-2 bg-green-50 rounded-md">
            <div className="flex items-center gap-2 overflow-hidden">
                <File className="h-5 w-5 text-green-700 flex-shrink-0"/>
                <span className="text-sm font-medium text-green-800 truncate">{uploadedFile.name}</span>
            </div>
            <Button
                variant="ghost"
                size="sm"
                onClick={onFileDelete}
                disabled={isDeleting}
            >
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4 text-red-500"/>}
                <span className="sr-only">{texts[lang].delete}</span>
            </Button>
        </div>
      ) : (
          <p className="text-sm text-gray-500">
            {lang === 'en' ? 'No document uploaded yet.' : 'Bado hakuna hati iliyopakiwa.'}
          </p>
      )}

      {!uploadedFile && (
        <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-grow">
                <Input type="file" id={documentType} onChange={handleFileChange} accept="image/jpeg,image/png,application/pdf" className="w-full" />
            </div>
            <Button onClick={handleUploadClick} disabled={!selectedFile || isUploading} className="w-full sm:w-auto bg-green-600 hover:bg-green-700">
                {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                {texts[lang].upload}
            </Button>
        </div>
      )}
    </div>
  );
};

export default DocumentUploader;
