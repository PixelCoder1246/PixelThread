'use client';

import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { Upload, X, File, Image } from 'lucide-react';
import styles from './FileUpload.module.css';

interface FilePreview {
  file: File;
  preview?: string;
}

interface FileUploadProps {
  onDrop: (files: File[]) => void;
  accept?: Record<string, string[]>;
  maxFiles?: number;
  maxSize?: number;
  files: FilePreview[];
  onRemove: (index: number) => void;
  label?: string;
  error?: string;
}

export default function FileUpload({
  onDrop,
  accept,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024,
  files,
  onRemove,
  label,
  error,
}: FileUploadProps) {
  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      onDrop(acceptedFiles);
    },
    [onDrop]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop: handleDrop,
      accept,
      maxFiles,
      maxSize,
      disabled: files.length >= maxFiles,
    });

  const isImageFile = (file: File) => file.type.startsWith('image/');

  return (
    <div className={styles.wrapper}>
      {label && <p className={styles.label}>{label}</p>}
      <div
        {...getRootProps()}
        className={cn(
          styles.dropzone,
          isDragActive && styles.dragActive,
          isDragReject && styles.dragReject,
          files.length >= maxFiles && styles.disabled
        )}
      >
        <input {...getInputProps()} />
        <Upload size={24} className={styles.uploadIcon} />
        <p className={styles.dropText}>
          {isDragActive
            ? 'Drop files here'
            : 'Drag & drop files or click to browse'}
        </p>
        <p className={styles.dropHint}>
          Max {maxFiles} file{maxFiles !== 1 ? 's' : ''} up to{' '}
          {Math.round(maxSize / 1024 / 1024)}MB each
        </p>
      </div>
      {error && <p className={styles.error}>{error}</p>}
      {files.length > 0 && (
        <ul className={styles.previewList}>
          {files.map((item, index) => (
            <li key={index} className={styles.previewItem}>
              <div className={styles.previewInfo}>
                {isImageFile(item.file) && item.preview ? (
                  <img
                    src={item.preview}
                    alt={item.file.name}
                    className={styles.thumbnail}
                  />
                ) : (
                  <div className={styles.fileIcon}>
                    {isImageFile(item.file) ? (
                      <Image size={20} />
                    ) : (
                      <File size={20} />
                    )}
                  </div>
                )}
                <div className={styles.fileDetails}>
                  <span className={styles.fileName}>{item.file.name}</span>
                  <span className={styles.fileSize}>
                    {(item.file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onRemove(index)}
                className={styles.removeButton}
                aria-label={`Remove ${item.file.name}`}
              >
                <X size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
