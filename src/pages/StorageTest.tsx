import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Download, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const StorageTest = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadPath, setUploadPath] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Suggest a path based on filename
      setUploadPath(`test/${selectedFile.name}`);
    }
  };

  const handleUpload = async () => {
    if (!file || !uploadPath) {
      toast({
        title: "Error",
        description: "Please select a file and enter an upload path",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const { data, error } = await supabase.storage
        .from('packages')
        .upload(uploadPath, file);

      if (error) throw error;

      toast({
        title: "Success",
        description: `File uploaded successfully to ${data.path}`,
      });

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('packages')
        .getPublicUrl(data.path);

      setDownloadUrl(urlData.publicUrl);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!uploadPath) {
      toast({
        title: "Error",
        description: "Please enter a file path to delete",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.storage
        .from('packages')
        .remove([uploadPath]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "File deleted successfully",
      });

      setDownloadUrl("");
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Supabase Storage Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="file">Select File</Label>
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                accept="image/*"
              />
            </div>

            <div>
              <Label htmlFor="path">Upload Path</Label>
              <Input
                id="path"
                value={uploadPath}
                onChange={(e) => setUploadPath(e.target.value)}
                placeholder="e.g. test/image.jpg"
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleUpload} 
                disabled={!file || !uploadPath || isUploading}
                className="flex-1"
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? "Uploading..." : "Upload"}
              </Button>

              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={!uploadPath}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>

            {downloadUrl && (
              <div className="mt-4">
                <Label>Public URL</Label>
                <div className="flex gap-2 mt-1">
                  <Input value={downloadUrl} readOnly />
                  <Button
                    variant="outline"
                    onClick={() => window.open(downloadUrl, '_blank')}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {downloadUrl && (
              <div className="mt-4">
                <Label>Preview</Label>
                <img 
                  src={downloadUrl} 
                  alt="Uploaded file" 
                  className="mt-2 max-w-full h-auto rounded-lg"
                  style={{ maxHeight: '300px' }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StorageTest;