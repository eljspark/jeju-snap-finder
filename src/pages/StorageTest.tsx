import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const StorageTest = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const fileName = `debug/test-${Date.now()}-${file.name}`;
      
      const { data, error: uploadError } = await supabase.storage
        .from('packages')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        setError(`Upload error: ${uploadError.message}`);
        console.error('Upload error:', uploadError);
        return;
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('packages')
        .getPublicUrl(fileName);

      setResult({
        uploadData: data,
        publicUrl: publicUrlData.publicUrl,
        fileName: fileName
      });

      console.log('Upload successful:', data);
      console.log('Public URL:', publicUrlData.publicUrl);

    } catch (err) {
      setError(`Unexpected error: ${err instanceof Error ? err.message : String(err)}`);
      console.error('Unexpected error:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Storage Upload Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>
          
          <Button 
            onClick={handleUpload} 
            disabled={!file || uploading}
            className="w-full"
          >
            {uploading ? 'Uploading...' : 'Test Upload to packages/debug/'}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <div className="space-y-4">
              <Alert>
                <AlertDescription>Upload successful!</AlertDescription>
              </Alert>
              
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Upload Result:</h3>
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
              
              {result.publicUrl && (
                <div>
                  <h3 className="font-semibold mb-2">Uploaded Image:</h3>
                  <img 
                    src={result.publicUrl} 
                    alt="Uploaded test" 
                    className="max-w-full max-h-64 object-contain border rounded"
                    onError={(e) => {
                      console.error('Image load error:', e);
                      setError('Failed to load uploaded image');
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StorageTest;