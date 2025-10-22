"use client";

import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  File, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  Archive
} from 'lucide-react';
import { toast } from 'sonner';

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  url?: string;
  chunks?: Blob[];
  uploadedChunks?: number;
  totalChunks?: number;
}

interface DocumentUploadProps {
  onUploadComplete?: (files: { id: string; url: string; name: string; size: number }[]) => void;
  maxFiles?: number;
  maxFileSize?: number; // in bytes
  acceptedFileTypes?: string[];
  entityId?: string;
  entityType?: 'lead' | 'property' | 'offer' | 'buyer';
}

const CHUNK_SIZE = 1024 * 1024; // 1MB chunks
const MAX_CONCURRENT_UPLOADS = 3;

export function DocumentUpload({
  onUploadComplete,
  maxFiles = 10,
  maxFileSize = 50 * 1024 * 1024, // 50MB default
  acceptedFileTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'text/plain'
  ],
  entityId,
  entityType
}: DocumentUploadProps) {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const uploadQueueRef = useRef<UploadFile[]>([]);
  const activeUploadsRef = useRef<Set<string>>(new Set());

  // File validation
  const validateFile = useCallback((file: File): string | null => {
    if (file.size > maxFileSize) {
      return `File size exceeds ${Math.round(maxFileSize / (1024 * 1024))}MB limit`;
    }
    
    if (!acceptedFileTypes.includes(file.type)) {
      return 'File type not supported';
    }
    
    return null;
  }, [maxFileSize, acceptedFileTypes]);

  // Create file chunks for upload
  const createChunks = useCallback((file: File): Blob[] => {
    const chunks: Blob[] = [];
    let start = 0;
    
    while (start < file.size) {
      const end = Math.min(start + CHUNK_SIZE, file.size);
      chunks.push(file.slice(start, end));
      start = end;
    }
    
    return chunks;
  }, []);

  // Upload single chunk
  const uploadChunk = async (
    fileId: string,
    chunk: Blob,
    chunkIndex: number,
    totalChunks: number,
    fileName: string
  ): Promise<void> => {
    const formData = new FormData();
    formData.append('chunk', chunk);
    formData.append('chunkIndex', chunkIndex.toString());
    formData.append('totalChunks', totalChunks.toString());
    formData.append('fileId', fileId);
    formData.append('fileName', fileName);
    
    if (entityId) formData.append('entityId', entityId);
    if (entityType) formData.append('entityType', entityType);

    const response = await fetch('/api/upload/chunk', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Chunk upload failed: ${response.statusText}`);
    }

    return response.json();
  };

  // Complete file upload
  const completeUpload = async (fileId: string, fileName: string): Promise<string> => {
    const response = await fetch('/api/upload/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileId,
        fileName,
        entityId,
        entityType,
      }),
    });

    if (!response.ok) {
      throw new Error(`Upload completion failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.url;
  };

  // Upload single file with chunking
  const uploadFile = async (uploadFile: UploadFile): Promise<void> => {
    try {
      setUploadFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { ...f, status: 'uploading', progress: 0 }
          : f
      ));

      const chunks = uploadFile.chunks!;
      let uploadedChunks = 0;

      // Upload chunks sequentially for reliability
      for (let i = 0; i < chunks.length; i++) {
        await uploadChunk(
          uploadFile.id,
          chunks[i],
          i,
          chunks.length,
          uploadFile.file.name
        );

        uploadedChunks++;
        const progress = Math.round((uploadedChunks / chunks.length) * 100);

        setUploadFiles(prev => prev.map(f => 
          f.id === uploadFile.id 
            ? { ...f, progress, uploadedChunks }
            : f
        ));
      }

      // Complete the upload
      const url = await completeUpload(uploadFile.id, uploadFile.file.name);

      setUploadFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { ...f, status: 'completed', progress: 100, url }
          : f
      ));

      toast.success(`${uploadFile.file.name} uploaded successfully`);

    } catch (error) {
      console.error('Upload error:', error);
      
      setUploadFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { 
              ...f, 
              status: 'error', 
              error: error instanceof Error ? error.message : 'Upload failed' 
            }
          : f
      ));

      toast.error(`Failed to upload ${uploadFile.file.name}`);
    }
  };

  // Process upload queue
  const processUploadQueue = useCallback(async () => {
    if (activeUploadsRef.current.size >= MAX_CONCURRENT_UPLOADS) {
      return;
    }

    const nextFile = uploadQueueRef.current.find(f => 
      f.status === 'pending' && !activeUploadsRef.current.has(f.id)
    );

    if (!nextFile) {
      if (activeUploadsRef.current.size === 0) {
        setIsUploading(false);
        
        // Check if all uploads completed successfully
        const completedFiles = uploadFiles
          .filter(f => f.status === 'completed')
          .map(f => ({
            id: f.id,
            url: f.url!,
            name: f.file.name,
            size: f.file.size,
          }));

        if (completedFiles.length > 0) {
          onUploadComplete?.(completedFiles);
        }
      }
      return;
    }

    activeUploadsRef.current.add(nextFile.id);
    
    try {
      await uploadFile(nextFile);
    } finally {
      activeUploadsRef.current.delete(nextFile.id);
      processUploadQueue(); // Process next file
    }
  }, [uploadFiles, onUploadComplete]);

  // Handle file drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (uploadFiles.length + acceptedFiles.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const newFiles: UploadFile[] = acceptedFiles.map(file => {
      const validationError = validateFile(file);
      
      if (validationError) {
        toast.error(`${file.name}: ${validationError}`);
        return null;
      }

      const chunks = createChunks(file);
      
      return {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        progress: 0,
        status: 'pending' as const,
        chunks,
        totalChunks: chunks.length,
        uploadedChunks: 0,
      };
    }).filter(Boolean) as UploadFile[];

    if (newFiles.length === 0) return;

    setUploadFiles(prev => [...prev, ...newFiles]);
    uploadQueueRef.current = [...uploadQueueRef.current, ...newFiles];
    
    if (!isUploading) {
      setIsUploading(true);
      processUploadQueue();
    }
  }, [uploadFiles.length, maxFiles, validateFile, createChunks, isUploading, processUploadQueue]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: acceptedFileTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
  });

  // Remove file
  const removeFile = (fileId: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== fileId));
    uploadQueueRef.current = uploadQueueRef.current.filter(f => f.id !== fileId);
  };

  // Retry failed upload
  const retryUpload = (fileId: string) => {
    setUploadFiles(prev => prev.map(f => 
      f.id === fileId 
        ? { ...f, status: 'pending', error: undefined, progress: 0 }
        : f
    ));
    
    const file = uploadFiles.find(f => f.id === fileId);
    if (file) {
      uploadQueueRef.current.push(file);
      if (!isUploading) {
        setIsUploading(true);
        processUploadQueue();
      }
    }
  };

  // Get file icon
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <ImageIcon className="h-4 w-4" />;
    if (fileType.includes('pdf')) return <FileText className="h-4 w-4" />;
    if (fileType.includes('spreadsheet') || fileType.includes('excel')) return <FileSpreadsheet className="h-4 w-4" />;
    if (fileType.includes('zip') || fileType.includes('rar')) return <Archive className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Document Upload
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drop Zone */}
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
            }
          `}
        >
          <input {...getInputProps()} />
          <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          {isDragActive ? (
            <p className="text-blue-600">Drop the files here...</p>
          ) : (
            <div>
              <p className="text-gray-600 mb-2">
                Drag & drop files here, or click to select files
              </p>
              <p className="text-sm text-gray-500">
                Max {maxFiles} files, up to {Math.round(maxFileSize / (1024 * 1024))}MB each
              </p>
            </div>
          )}
        </div>

        {/* File List */}
        {uploadFiles.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Files ({uploadFiles.length})</h4>
            {uploadFiles.map((uploadFile) => (
              <div
                key={uploadFile.id}
                className="flex items-center gap-3 p-3 border rounded-lg"
              >
                <div className="flex-shrink-0">
                  {getFileIcon(uploadFile.file.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium truncate">
                      {uploadFile.file.name}
                    </p>
                    <Badge
                      variant={
                        uploadFile.status === 'completed' ? 'default' :
                        uploadFile.status === 'error' ? 'destructive' :
                        uploadFile.status === 'uploading' ? 'secondary' : 'outline'
                      }
                    >
                      {uploadFile.status === 'uploading' && (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      )}
                      {uploadFile.status === 'completed' && (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      )}
                      {uploadFile.status === 'error' && (
                        <AlertCircle className="h-3 w-3 mr-1" />
                      )}
                      {uploadFile.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{formatFileSize(uploadFile.file.size)}</span>
                    {uploadFile.status === 'uploading' && uploadFile.totalChunks && (
                      <span>
                        {uploadFile.uploadedChunks}/{uploadFile.totalChunks} chunks
                      </span>
                    )}
                  </div>
                  
                  {uploadFile.status === 'uploading' && (
                    <Progress value={uploadFile.progress} className="mt-2" />
                  )}
                  
                  {uploadFile.error && (
                    <p className="text-xs text-red-600 mt-1">{uploadFile.error}</p>
                  )}
                </div>
                
                <div className="flex-shrink-0 flex items-center gap-1">
                  {uploadFile.status === 'error' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => retryUpload(uploadFile.id)}
                    >
                      Retry
                    </Button>
                  )}
                  
                  {uploadFile.status !== 'uploading' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFile(uploadFile.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}