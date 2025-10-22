"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  File, 
  Download, 
  Eye, 
  Trash2, 
  Search, 
  Filter,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  Archive,
  Calendar,
  User
} from 'lucide-react';
import { toast } from 'sonner';

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: Date;
  uploadedBy: string;
  entityId?: string;
  entityType?: 'lead' | 'property' | 'offer' | 'buyer';
  tags?: string[];
}

interface DocumentViewerProps {
  documents: Document[];
  onDelete?: (documentId: string) => void;
  onDownload?: (document: Document) => void;
  onView?: (document: Document) => void;
  showActions?: boolean;
  entityId?: string;
  entityType?: 'lead' | 'property' | 'offer' | 'buyer';
}

export function DocumentViewer({
  documents,
  onDelete,
  onDownload,
  onView,
  showActions = true,
  entityId,
  entityType
}: DocumentViewerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter and sort documents
  const filteredDocuments = documents
    .filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || doc.type.includes(filterType);
      const matchesEntity = !entityId || doc.entityId === entityId;
      return matchesSearch && matchesType && matchesEntity;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Get file icon based on type
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <ImageIcon className="h-5 w-5 text-blue-500" />;
    if (fileType.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />;
    if (fileType.includes('spreadsheet') || fileType.includes('excel')) return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
    if (fileType.includes('zip') || fileType.includes('rar')) return <Archive className="h-5 w-5 text-purple-500" />;
    return <File className="h-5 w-5 text-gray-500" />;
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  // Handle download
  const handleDownload = async (document: Document) => {
    try {
      if (onDownload) {
        onDownload(document);
      } else {
        // Default download behavior
        const response = await fetch(document.url);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = window.document.createElement('a');
        a.href = url;
        a.download = document.name;
        window.document.body.appendChild(a);
        a.click();
        window.document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
      toast.success(`Downloaded ${document.name}`);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download document');
    }
  };

  // Handle view
  const handleView = (document: Document) => {
    if (onView) {
      onView(document);
    } else {
      // Default view behavior - open in new tab
      window.open(document.url, '_blank');
    }
  };

  // Handle delete
  const handleDelete = (document: Document) => {
    if (onDelete) {
      onDelete(document.id);
      toast.success(`Deleted ${document.name}`);
    }
  };

  // Get file type categories for filter
  const getFileTypeCategories = () => {
    const categories = new Set<string>();
    documents.forEach(doc => {
      if (doc.type.startsWith('image/')) categories.add('image');
      else if (doc.type.includes('pdf')) categories.add('pdf');
      else if (doc.type.includes('spreadsheet') || doc.type.includes('excel')) categories.add('spreadsheet');
      else if (doc.type.includes('word')) categories.add('document');
      else categories.add('other');
    });
    return Array.from(categories);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <File className="h-5 w-5" />
            Documents ({filteredDocuments.length})
          </div>
          
          {/* Sort Controls */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'size')}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="size">Sort by Size</option>
            </select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
          </div>
        </CardTitle>
        
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="all">All Types</option>
            {getFileTypeCategories().map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-8">
            <File className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">
              {documents.length === 0 ? 'No documents uploaded yet' : 'No documents match your search'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredDocuments.map((document) => (
              <div
                key={document.id}
                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                {/* File Icon */}
                <div className="flex-shrink-0">
                  {getFileIcon(document.type)}
                </div>
                
                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium truncate">{document.name}</h4>
                    {document.tags && document.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(document.uploadedAt)}
                    </span>
                    
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {document.uploadedBy}
                    </span>
                    
                    <span>{formatFileSize(document.size)}</span>
                    
                    {document.entityType && (
                      <Badge variant="outline" className="text-xs">
                        {document.entityType}
                      </Badge>
                    )}
                  </div>
                </div>
                
                {/* Actions */}
                {showActions && (
                  <div className="flex-shrink-0 flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleView(document)}
                      title="View document"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDownload(document)}
                      title="Download document"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    
                    {onDelete && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(document)}
                        title="Delete document"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}