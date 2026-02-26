import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, X, Image as ImageIcon, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Validate file type and size
 */
const validateFile = (file, maxSizeMB, t) => {
  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    toast.error(t('workshops.images.invalidType'));
    return false;
  }

  // Check file size
  const maxSize = maxSizeMB * 1024 * 1024;
  if (file.size > maxSize) {
    toast.error(t('workshops.images.fileTooLarge', { size: maxSizeMB }));
    return false;
  }

  return true;
};

/**
 * ImageUploader Component
 * Reusable component for uploading images with drag-and-drop support
 */
const ImageUploader = ({
  workshopId,
  useProfileMe = false,
  currentImages = [],
  currentLogo = null,
  type = 'images', // 'images' or 'logo'
  onUploadSuccess,
  maxImages = 10,
  maxSizeMB = 5
}) => {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const basePath = useProfileMe ? '/api/workshops/profile/me' : `/api/workshops/${workshopId}`;

  const handleUpload = useCallback(async (files) => {
    if (!files || files.length === 0) return;

    // Validate files
    const validFiles = Array.from(files).filter(file => validateFile(file, maxSizeMB, t));
    if (validFiles.length === 0) return;

    // Check max images limit for gallery
    if (type === 'images' && currentImages.length + validFiles.length > maxImages) {
      toast.error(t('workshops.images.maxImagesReached', { max: maxImages }));
      return;
    }

    // For logo, only allow one file
    if (type === 'logo' && validFiles.length > 1) {
      toast.error(t('workshops.images.onlyOneLogo'));
      return;
    }

    setUploading(true);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();

      if (type === 'logo') {
        formData.append('file', validFiles[0]);
      } else {
        validFiles.forEach(file => {
          formData.append('files', file);
        });
      }

      const endpoint = type === 'logo' ? `${basePath}/logo` : `${basePath}/images`;

      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}${endpoint}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await response.json();
      toast.success(data.message);

      if (onUploadSuccess) {
        onUploadSuccess(data.data);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  }, [basePath, type, currentImages, maxImages, maxSizeMB, onUploadSuccess, t]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files);
    }
  }, [handleUpload]);

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUpload(e.target.files);
    }
  };

  const handleDelete = async (imageUrl, index) => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = type === 'logo' ? `${basePath}/logo` : `${basePath}/images/${index}`;
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}${endpoint}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Delete failed');
      }

      const data = await response.json();
      toast.success(data.message);

      if (onUploadSuccess) {
        onUploadSuccess(data.data);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id={`file-upload-${type}`}
          className="hidden"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple={type === 'images'}
          onChange={handleFileInput}
          disabled={uploading}
        />

        <label
          htmlFor={`file-upload-${type}`}
          className="cursor-pointer flex flex-col items-center"
        >
          {uploading ? (
            <>
              <Loader className="w-12 h-12 text-blue-500 animate-spin mb-4" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('workshops.images.uploading')}
              </p>
            </>
          ) : (
            <>
              <Upload className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('workshops.images.dragDrop')}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {type === 'logo'
                  ? t('workshops.images.logoHint')
                  : t('workshops.images.imagesHint', { max: maxImages })}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                JPEG, PNG, WebP • {t('workshops.images.maxSize', { size: maxSizeMB })}
              </p>
            </>
          )}
        </label>
      </div>

      {/* Current Images Display */}
      {type === 'logo' && currentLogo && (
        <div className="relative inline-block">
          <img
            src={`${import.meta.env.VITE_API_URL}${currentLogo}`}
            alt="Workshop Logo"
            className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700"
          />
          <button
            onClick={() => handleDelete(currentLogo)}
            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {type === 'images' && currentImages && currentImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {currentImages.map((imageUrl, index) => (
            <div key={index} className="relative group">
              <img
                src={`${import.meta.env.VITE_API_URL}${imageUrl}`}
                alt={`Workshop ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700"
              />
              <button
                onClick={() => handleDelete(imageUrl, index)}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
              >
                <X size={16} />
              </button>
              <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                {index + 1} / {currentImages.length}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {type === 'images' && (!currentImages || currentImages.length === 0) && (
        <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('workshops.images.noImages')}
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
