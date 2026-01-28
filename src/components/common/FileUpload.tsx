import React, { useCallback, useState } from 'react';
import { Upload, X, FileText, FileSpreadsheet, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn, formatFileSize, getFileExtension, isValidFileType, generateId } from '@/lib/utils';
import { UploadedFile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface FileUploadProps {
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  acceptedFormats?: string[];
  maxFileSize?: number; // in bytes
  multiple?: boolean;
  label?: string;
  description?: string;
  className?: string;
}

const defaultAcceptedFormats = ['pdf', 'xls', 'xlsx'];
const defaultMaxFileSize = 100 * 1024 * 1024; // 100MB

function getFileIcon(filename: string) {
  const ext = getFileExtension(filename);
  if (ext === 'pdf') return <FileText className="h-5 w-5 text-error" />;
  if (['xls', 'xlsx'].includes(ext)) return <FileSpreadsheet className="h-5 w-5 text-success" />;
  return <FileText className="h-5 w-5 text-neutral-400" />;
}

export function FileUpload({
  files,
  onFilesChange,
  acceptedFormats = defaultAcceptedFormats,
  maxFileSize = defaultMaxFileSize,
  multiple = true,
  label,
  description,
  className,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (fileList: FileList) => {
      const newFiles: UploadedFile[] = [];

      Array.from(fileList).forEach((file) => {
        const isValid = isValidFileType(file.name, acceptedFormats);
        const isUnderSize = file.size <= maxFileSize;

        if (isValid && isUnderSize) {
          const uploadedFile: UploadedFile = {
            id: generateId(),
            name: file.name,
            size: file.size,
            type: file.type,
            uploadProgress: 0,
            status: 'uploading',
          };
          newFiles.push(uploadedFile);

          // Simulate upload progress
          let progress = 0;
          const interval = setInterval(() => {
            progress += Math.random() * 30;
            if (progress >= 100) {
              progress = 100;
              clearInterval(interval);
              onFilesChange(
                [...files, ...newFiles].map((f) =>
                  f.id === uploadedFile.id ? { ...f, uploadProgress: 100, status: 'complete' as const } : f
                )
              );
            } else {
              onFilesChange(
                [...files, ...newFiles].map((f) =>
                  f.id === uploadedFile.id ? { ...f, uploadProgress: Math.round(progress) } : f
                )
              );
            }
          }, 200);
        }
      });

      if (newFiles.length > 0) {
        onFilesChange([...files, ...newFiles]);
      }
    },
    [files, onFilesChange, acceptedFormats, maxFileSize]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files);
      }
    },
    [handleFiles]
  );

  const removeFile = useCallback(
    (fileId: string) => {
      onFilesChange(files.filter((f) => f.id !== fileId));
    },
    [files, onFilesChange]
  );

  const acceptString = acceptedFormats.map((f) => `.${f}`).join(',');

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-neutral-900 mb-2">{label}</label>
      )}

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
          isDragging
            ? 'border-primary bg-primary-50'
            : 'border-neutral-300 hover:border-primary hover:bg-neutral-50'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={acceptString}
          multiple={multiple}
          onChange={handleInputChange}
          className="hidden"
          aria-label={label || 'Upload files'}
        />
        <Upload className={cn('h-8 w-8 mx-auto mb-3', isDragging ? 'text-primary' : 'text-neutral-400')} />
        <p className="text-sm font-medium text-neutral-900 mb-1">
          Drop files here or <span className="text-primary">browse</span>
        </p>
        <p className="text-xs text-neutral-500">
          {description || `Supported formats: ${acceptedFormats.map((f) => f.toUpperCase()).join(', ')}`}
        </p>
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file) => (
            <FileItem key={file.id} file={file} onRemove={() => removeFile(file.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function FileItem({ file, onRemove }: { file: UploadedFile; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-3 p-3 border border-neutral-200 rounded-lg bg-white">
      {getFileIcon(file.name)}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-neutral-900 truncate">{file.name}</p>
        <p className="text-xs text-neutral-500">{formatFileSize(file.size)}</p>
        {file.status === 'uploading' && (
          <Progress value={file.uploadProgress} className="h-1 mt-1" />
        )}
      </div>
      <div className="flex items-center gap-2">
        {file.status === 'uploading' && (
          <Loader2 className="h-4 w-4 text-primary animate-spin" />
        )}
        {file.status === 'complete' && (
          <CheckCircle2 className="h-4 w-4 text-success" />
        )}
        {file.status === 'error' && (
          <AlertCircle className="h-4 w-4 text-error" />
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label={`Remove ${file.name}`}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
