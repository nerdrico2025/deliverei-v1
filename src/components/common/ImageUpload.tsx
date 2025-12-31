import React, { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { uploadImage, deleteImage } from '../../services/supabaseClient';
import { useToast } from '../../ui/feedback/ToastContext';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  disabled?: boolean;
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  onRemove,
  disabled = false,
  className = '',
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(value);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { push } = useToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      push({
        message: 'Formato de arquivo inválido. Use JPEG, PNG, WebP ou GIF.',
        tone: 'error',
      });
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      push({
        message: 'Arquivo muito grande. O tamanho máximo é 5MB.',
        tone: 'error',
      });
      return;
    }

    try {
      setUploading(true);
      try {
        const { storageApi } = await import('../../services/backendApi');
        const bucket = (import.meta.env.VITE_SUPABASE_BUCKET as string | undefined) || 'produtos';
        await storageApi.ensureBucket(bucket);
      } catch {}

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload via backend (service role) to evitar RLS
      const { storageApi } = await import('../../services/backendApi');
      const bucket = (import.meta.env.VITE_SUPABASE_BUCKET as string | undefined) || 'produtos';
      const form = new FormData();
      form.append('file', file);
      form.append('bucket', bucket);
      const { default: apiClient } = await import('../../services/apiClient');
      const res = await apiClient.post('/v1/storage/upload-image', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onChange(res?.data?.url || '');

      push({
        message: 'Imagem enviada com sucesso!',
        tone: 'success',
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      push({ message: error instanceof Error ? error.message : 'Erro ao enviar imagem', tone: 'error' });
      setPreviewUrl(undefined);
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = async () => {
    if (!value) return;

    try {
      // Try to delete from Supabase if it's a Supabase URL
      if (value.includes('supabase.co')) {
        await deleteImage(value);
      }
      
      setPreviewUrl(undefined);
      onChange('');
      
      if (onRemove) {
        onRemove();
      }

      push({
        message: 'Imagem removida com sucesso!',
        tone: 'success',
      });
    } catch (error) {
      console.error('Error removing image:', error);
      // Still remove from UI even if deletion fails
      setPreviewUrl(undefined);
      onChange('');
      
      if (onRemove) {
        onRemove();
      }
    }
  };

  const handleClick = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        disabled={disabled || uploading}
        className="hidden"
        aria-label="Upload de imagem"
      />

      {previewUrl || value ? (
        <div className="relative group">
          <img
            src={previewUrl || value}
            alt="Preview"
            className="w-full rounded-lg border border-[#E5E7EB] object-cover"
            style={{ maxHeight: '300px' }}
          />
          {!disabled && !uploading && (
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              aria-label="Remover imagem"
            >
              <X size={16} />
            </button>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
              <Loader2 className="animate-spin text-white" size={32} />
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={handleClick}
          disabled={disabled || uploading}
          className={`w-full h-48 border-2 border-dashed border-[#E5E7EB] rounded-lg flex flex-col items-center justify-center gap-2 transition-colors ${
            disabled || uploading
              ? 'cursor-not-allowed opacity-50'
              : 'hover:border-[#D22630] hover:bg-gray-50 cursor-pointer'
          }`}
          type="button"
        >
          {uploading ? (
            <>
              <Loader2 className="animate-spin text-[#D22630]" size={32} />
              <span className="text-sm text-[#4B5563]">Enviando imagem...</span>
            </>
          ) : (
            <>
              <Upload className="text-[#9CA3AF]" size={32} />
              <div className="text-center">
                <p className="text-sm font-medium text-[#1F2937]">
                  Clique para fazer upload
                </p>
                <p className="text-xs text-[#9CA3AF] mt-1">
                  JPEG, PNG, WebP ou GIF (máx. 5MB)
                </p>
              </div>
            </>
          )}
        </button>
      )}
    </div>
  );
};
