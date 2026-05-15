'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Upload, Trash2, Loader } from 'lucide-react';

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  customerName: string;
  onAvatarUpdated?: (url: string) => void;
}

export function AvatarUpload({
  currentAvatarUrl = '/placeholder-user.jpg',
  customerName,
  onAvatarUpdated,
}: AvatarUploadProps) {
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Помилка',
        description: 'Виберіть зображення',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Помилка',
        description: 'Розмір файлу не повинен перевищувати 5MB',
        variant: 'destructive',
      });
      return;
    }

    // Show preview
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);

    // Upload file
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/auth/avatar', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setAvatarUrl(data.avatar_url);
        setPreviewUrl(null);
        toast({
          title: 'Успіх',
          description: 'Аватар успішно завантажено',
        });
        onAvatarUpdated?.(data.avatar_url);
      } else {
        const error = await response.json();
        toast({
          title: 'Помилка',
          description: error.error || 'Не вдалось завантажити аватар',
          variant: 'destructive',
        });
        setPreviewUrl(null);
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: 'Помилка',
        description: 'Сталась помилка при завантаженні',
        variant: 'destructive',
      });
      setPreviewUrl(null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteAvatar = async () => {
    if (!confirm('Ви впевнені, що хочете видалити аватар?')) {
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch('/api/auth/avatar', {
        method: 'DELETE',
      });

      if (response.ok) {
        setAvatarUrl('/placeholder-user.jpg');
        toast({
          title: 'Успіх',
          description: 'Аватар видалено',
        });
        onAvatarUpdated?.('/placeholder-user.jpg');
      } else {
        const error = await response.json();
        toast({
          title: 'Помилка',
          description: error.error || 'Не вдалось видалити аватар',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting avatar:', error);
      toast({
        title: 'Помилка',
        description: 'Сталась помилка при видаленні',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-display text-foreground">Аватар</h3>

      {/* Avatar Preview */}
      <div className="flex justify-center">
        <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-foreground/10 bg-foreground/5">
          <Image
            src={previewUrl || avatarUrl}
            alt={customerName}
            fill
            className="object-cover"
            sizes="128px"
          />
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader className="w-6 h-6 text-white animate-spin" />
            </div>
          )}
        </div>
      </div>

      {/* Upload Instructions */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-xs text-blue-600">
          Формати: JPG, PNG, WebP. Максимум 5MB.
        </p>
      </div>

      {/* Upload Button */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading || deleting}
        />
        <Button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || deleting}
          className="w-full"
          variant="outline"
        >
          <Upload className="w-4 h-4 mr-2" />
          {uploading ? 'Завантаження...' : 'Вибрати фото'}
        </Button>
      </div>

      {/* Delete Button */}
      {avatarUrl !== '/placeholder-user.jpg' && (
        <Button
          type="button"
          onClick={handleDeleteAvatar}
          disabled={uploading || deleting}
          variant="destructive"
          className="w-full"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          {deleting ? 'Видалення...' : 'Видалити аватар'}
        </Button>
      )}
    </div>
  );
}
