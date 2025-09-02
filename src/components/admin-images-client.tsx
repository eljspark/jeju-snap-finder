"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, Upload, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StorageFile {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: any;
}

export default function AdminImagesClient() {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [selectedFolder, setSelectedFolder] = useState("test");
  const { toast } = useToast();

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from('packages')
        .list(selectedFolder, {
          limit: 100,
          offset: 0,
        });

      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast({
        title: "Error",
        description: "Failed to fetch files",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [selectedFolder]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length === 0) return;

    setUploadingFiles(selectedFiles);

    try {
      for (const file of selectedFiles) {
        const filePath = `${selectedFolder}/${file.name}`;
        
        const { error } = await supabase.storage
          .from('packages')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
          });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `${selectedFiles.length} file(s) uploaded successfully`,
      });

      fetchFiles(); // Refresh the file list
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setUploadingFiles([]);
    }
  };

  const handleDelete = async (fileName: string) => {
    try {
      const filePath = `${selectedFolder}/${fileName}`;
      const { error } = await supabase.storage
        .from('packages')
        .remove([filePath]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "File deleted successfully",
      });

      fetchFiles(); // Refresh the file list
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const getFileUrl = (fileName: string) => {
    const { data } = supabase.storage
      .from('packages')
      .getPublicUrl(`${selectedFolder}/${fileName}`);
    return data.publicUrl;
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Image Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="folder">Folder</Label>
                <Input
                  id="folder"
                  value={selectedFolder}
                  onChange={(e) => setSelectedFolder(e.target.value)}
                  placeholder="Enter folder name"
                />
              </div>
              <Button onClick={fetchFiles} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            <div>
              <Label htmlFor="upload">Upload Images</Label>
              <Input
                id="upload"
                type="file"
                onChange={handleFileUpload}
                accept="image/*"
                multiple
                disabled={uploadingFiles.length > 0}
              />
              {uploadingFiles.length > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  Uploading {uploadingFiles.length} file(s)...
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Files in /{selectedFolder}</CardTitle>
              <Badge variant="secondary">{files.length} files</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading files...</p>
            ) : files.length === 0 ? (
              <p className="text-muted-foreground">No files found in this folder.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {files.map((file) => (
                  <div key={file.id} className="border rounded-lg p-4 space-y-2">
                    <img
                      src={getFileUrl(file.name)}
                      alt={file.name}
                      className="w-full h-40 object-cover rounded"
                    />
                    <p className="text-sm font-medium truncate" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(file.created_at).toLocaleDateString()}
                    </p>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(file.name)}
                      className="w-full"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}