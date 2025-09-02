import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Upload,
  File,
  AlertCircle,
  CheckCircle,
  X,
  FolderOpen,
  Image as ImageIcon,
  Star,
  StarOff
} from 'lucide-react';

interface Package {
  id: string;
  title: string;
  folder_path: string | null;
  thumbnail_url: string | null;
}

interface StorageFile {
  name: string;
  size?: number;
  url: string;
}

interface UploadFile {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  storageUrl?: string;
}

export default function AdminImages() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [existingFiles, setExistingFiles] = useState<StorageFile[]>([]);
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [filesLoading, setFilesLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Fetch packages
  useEffect(() => {
    const fetchPackages = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('packages')
          .select('id, title, folder_path, thumbnail_url')
          .order('title');
        
        if (error) throw error;
        setPackages(data || []);
        
        // Update selected package if it exists
        if (selectedPackage) {
          const updatedSelectedPackage = data?.find(pkg => pkg.id === selectedPackage.id);
          if (updatedSelectedPackage) {
            setSelectedPackage(updatedSelectedPackage);
          }
        }
      } catch (error) {
        console.error('Error fetching packages:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch packages',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchPackages();
  }, [toast]); // Removed selectedPackage dependency to prevent loops

  // Filter packages based on search
  const filteredPackages = packages.filter(pkg =>
    pkg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pkg.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Fetch existing files when package is selected
  useEffect(() => {
    const fetchExistingFiles = async () => {
      if (!selectedPackage) {
        setExistingFiles([]);
        return;
      }

      setFilesLoading(true);
      try {
        const folderPath = selectedPackage.folder_path || selectedPackage.id;
        const { data: files, error } = await supabase.storage
          .from('packages')
          .list(folderPath, {
            limit: 100,
            sortBy: { column: 'name', order: 'asc' }
          });

        if (error) throw error;

        if (files) {
          // Log raw files for debugging
          console.log('Raw files from storage:', files);
          
          const imageFiles = files.filter(file => 
            file.name && /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name)
          );

          console.log('Filtered image files:', imageFiles);

          const filesWithUrls = imageFiles.map(file => {
            const fullPath = `${folderPath}/${file.name}`;
            const { data } = supabase.storage
              .from('packages')
              .getPublicUrl(fullPath);
            
            return {
              name: file.name,
              size: file.metadata?.size,
              url: data.publicUrl
            };
          });

          console.log('Files with URLs:', filesWithUrls);
          setExistingFiles(filesWithUrls);
        }
      } catch (error) {
        console.error('Error fetching existing files:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch existing files',
          variant: 'destructive'
        });
      } finally {
        setFilesLoading(false);
      }
    };

    fetchExistingFiles();
  }, [selectedPackage, toast]);

  // Sanitize filename
  const sanitizeFileName = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  };

  // Handle file upload
  const uploadFile = async (uploadFile: UploadFile) => {
    if (!selectedPackage) return;

    const timestamp = Date.now();
    const sanitizedName = sanitizeFileName(uploadFile.file.name);
    const folderPath = selectedPackage.folder_path || selectedPackage.id;
    const fileName = `${timestamp}_${sanitizedName}`;
    const fullPath = `${folderPath}/${fileName}`;

    try {
      setUploadFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { ...f, status: 'uploading', progress: 0 }
          : f
      ));

      const { data, error } = await supabase.storage
        .from('packages')
        .upload(fullPath, uploadFile.file, {
          upsert: false
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('packages')
        .getPublicUrl(fullPath);

      // Update package if needed
      const updates: any = {};
      
      // Set folder_path if empty
      if (!selectedPackage.folder_path) {
        updates.folder_path = selectedPackage.id;
      }
      
      // Set thumbnail_url if NULL and this is the first successful upload
      if (!selectedPackage.thumbnail_url && uploadFiles.filter(f => f.status === 'success').length === 0) {
        updates.thumbnail_url = urlData.publicUrl;
      }

      if (Object.keys(updates).length > 0) {
        await supabase
          .from('packages')
          .update(updates)
          .eq('id', selectedPackage.id);
        
        // Update local state
        setSelectedPackage(prev => prev ? { ...prev, ...updates } : null);
        setPackages(prev => prev.map(pkg => 
          pkg.id === selectedPackage.id ? { ...pkg, ...updates } : pkg
        ));
      }

      setUploadFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { ...f, status: 'success', progress: 100, storageUrl: urlData.publicUrl }
          : f
      ));

      // Refresh existing files
      setExistingFiles(prev => [...prev, {
        name: fileName,
        size: uploadFile.file.size,
        url: urlData.publicUrl
      }]);

      toast({
        title: 'Success',
        description: `${uploadFile.file.name} uploaded successfully`
      });

    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { ...f, status: 'error', error: error.message || 'Upload failed' }
          : f
      ));

      toast({
        title: 'Upload Error',
        description: error.message || 'Failed to upload file',
        variant: 'destructive'
      });
    }
  };

  // Handle file selection
  const handleFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const imageFiles = fileArray.filter(file => 
      file.type.startsWith('image/')
    );

    const newUploadFiles: UploadFile[] = imageFiles.map(file => ({
      file,
      id: `${Date.now()}_${Math.random()}`,
      progress: 0,
      status: 'pending'
    }));

    setUploadFiles(prev => [...prev, ...newUploadFiles]);

    // Start uploading files one by one
    newUploadFiles.forEach(uploadFileItem => {
      uploadFile(uploadFileItem);
    });
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!selectedPackage) {
      toast({
        title: 'Error',
        description: 'Please select a package first',
        variant: 'destructive'
      });
      return;
    }

    const files = e.dataTransfer.files;
    handleFiles(files);
  };

  // Clipboard paste handler
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!selectedPackage) return;
      
      const items = e.clipboardData?.items;
      if (!items) return;

      const files: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === 'file' && item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }

      if (files.length > 0) {
        handleFiles(files);
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [selectedPackage]);

  // Remove upload file
  const removeUploadFile = (id: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== id));
  };

  // Set thumbnail
  const setThumbnail = async (file: StorageFile) => {
    if (!selectedPackage) return;

    try {
      const folderPath = selectedPackage.folder_path || selectedPackage.id;
      const fullPath = `${folderPath}/${file.name}`;
      
      console.log('Setting thumbnail:', {
        packageId: selectedPackage.id,
        folderPath,
        fileName: file.name,
        fullPath
      });

      const updates: any = {
        thumbnail_url: fullPath // Store as path, not full URL
      };

      // Also set folder_path if it's missing
      if (!selectedPackage.folder_path) {
        updates.folder_path = folderPath;
      }

      console.log('Updating package with:', updates);

      const { data, error } = await supabase
        .from('packages')
        .update(updates)
        .eq('id', selectedPackage.id)
        .select('*'); // Select all fields to get back the updated data

      if (error) {
        console.error('Database update error:', error);
        throw error;
      }

      console.log('Update successful:', data);

      // If we got data back, use it; otherwise use our updates object
      const updatedData = data && data.length > 0 ? data[0] : { ...selectedPackage, ...updates };

      // Update local state with the actual database response
      setSelectedPackage(updatedData);
      setPackages(prev => prev.map(pkg => 
        pkg.id === selectedPackage.id ? updatedData : pkg
      ));

      toast({
        title: 'Success',
        description: `${file.name} set as thumbnail`
      });

    } catch (error: any) {
      console.error('Error setting thumbnail:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to set thumbnail',
        variant: 'destructive'
      });
    }
  };

  // Format file size
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center space-x-2">
          <ImageIcon className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Admin - Package Images</h1>
        </div>

        {/* Package Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Select Package</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Search by title or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
            
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <Select
                value={selectedPackage?.id || ''}
                onValueChange={(value) => {
                  const pkg = packages.find(p => p.id === value);
                  setSelectedPackage(pkg || null);
                  setUploadFiles([]);
                }}
              >
                <SelectTrigger className="max-w-md">
                  <SelectValue placeholder="Choose a package..." />
                </SelectTrigger>
                <SelectContent>
                  {filteredPackages.map((pkg) => (
                    <SelectItem key={pkg.id} value={pkg.id}>
                      {pkg.title} ({pkg.id.slice(0, 8)}...)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {selectedPackage && (
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">{selectedPackage.title}</h3>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p><strong>ID:</strong> {selectedPackage.id}</p>
                  <p><strong>Folder Path:</strong> {selectedPackage.folder_path || 'Not set (will use ID)'}</p>
                  <p><strong>Thumbnail:</strong> {selectedPackage.thumbnail_url || 'Not set (will use first upload)'}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {selectedPackage && (
          <>
            {/* Upload Area */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="h-5 w-5" />
                  <span>Upload Images</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">Drop images here</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    or paste from clipboard (Ctrl+V) or click to select
                  </p>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                  >
                    Select Files
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) {
                        handleFiles(e.target.files);
                      }
                    }}
                  />
                </div>

                {/* Upload Progress */}
                {uploadFiles.length > 0 && (
                  <div className="mt-6 space-y-3">
                    <h4 className="font-medium">Upload Progress</h4>
                    {uploadFiles.map((uploadFile) => (
                      <div key={uploadFile.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <File className="h-4 w-4 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{uploadFile.file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(uploadFile.file.size)}
                          </p>
                          {uploadFile.status === 'uploading' && (
                            <Progress value={uploadFile.progress} className="mt-1" />
                          )}
                          {uploadFile.status === 'error' && (
                            <p className="text-xs text-destructive mt-1">{uploadFile.error}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {uploadFile.status === 'success' && (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                          {uploadFile.status === 'error' && (
                            <AlertCircle className="h-4 w-4 text-destructive" />
                          )}
                          {uploadFile.status === 'pending' && (
                            <Badge variant="secondary">Pending</Badge>
                          )}
                          {uploadFile.status === 'uploading' && (
                            <Badge variant="secondary">Uploading</Badge>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => removeUploadFile(uploadFile.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Existing Files */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FolderOpen className="h-5 w-5" />
                  <span>Existing Files ({existingFiles.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filesLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className="aspect-square rounded-lg" />
                    ))}
                  </div>
                ) : existingFiles.length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>No images found in this package folder</AlertDescription>
                  </Alert>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {existingFiles.map((file) => {
                      // Check if this file is the current thumbnail
                      // Since we store path but compare against full URLs, we need to check both
                      const folderPath = selectedPackage.folder_path || selectedPackage.id;
                      const fullPath = `${folderPath}/${file.name}`;
                      
                      const isThumbnail = selectedPackage.thumbnail_url === fullPath ||
                                         selectedPackage.thumbnail_url === file.name;
                      
                      return (
                        <div key={file.name} className="group relative">
                          <div className={`aspect-square rounded-lg overflow-hidden bg-muted relative ${isThumbnail ? 'ring-2 ring-primary' : ''}`}>
                            <img
                              src={file.url}
                              alt={file.name}
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              loading="lazy"
                            />
                            {isThumbnail && (
                              <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                                <Star className="h-4 w-4 fill-current" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Button
                                size="sm"
                                variant={isThumbnail ? "secondary" : "default"}
                                onClick={() => setThumbnail(file)}
                                className="gap-2"
                              >
                                {isThumbnail ? (
                                  <>
                                    <StarOff className="h-4 w-4" />
                                    Current Thumbnail
                                  </>
                                ) : (
                                  <>
                                    <Star className="h-4 w-4" />
                                    Set as Thumbnail
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                          <div className="mt-2">
                            <p className="text-sm font-medium truncate" title={file.name}>
                              {file.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(file.size)} 
                              {isThumbnail && <span className="text-primary font-medium"> • Thumbnail</span>}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
