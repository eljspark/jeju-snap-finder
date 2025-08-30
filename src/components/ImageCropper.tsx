import { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageCropperProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imageName: string;
  onCropComplete: (croppedImageBlob: Blob, fileName: string) => Promise<void>;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  );
}

export function ImageCropper({ isOpen, onClose, imageUrl, imageName, onCropComplete }: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [aspect, setAspect] = useState<number | undefined>(16 / 9);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    if (aspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspect));
    }
  }, [aspect]);

  const getCroppedImg = useCallback(
    async (image: HTMLImageElement, crop: PixelCrop, scale = 1, rotate = 0): Promise<Blob | null> => {
      const canvas = canvasRef.current;
      if (!canvas || !crop) return null;

      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      const pixelRatio = window.devicePixelRatio;
      
      canvas.width = Math.floor(crop.width * scaleX * pixelRatio);
      canvas.height = Math.floor(crop.height * scaleY * pixelRatio);

      ctx.scale(pixelRatio, pixelRatio);
      ctx.imageSmoothingQuality = 'high';

      const cropX = crop.x * scaleX;
      const cropY = crop.y * scaleY;

      const rotateRads = rotate * Math.PI / 180;
      const centerX = image.naturalWidth / 2;
      const centerY = image.naturalHeight / 2;

      ctx.save();

      ctx.translate(-cropX, -cropY);
      ctx.translate(centerX, centerY);
      ctx.rotate(rotateRads);
      ctx.scale(scale, scale);
      ctx.translate(-centerX, -centerY);
      ctx.drawImage(
        image,
        0,
        0,
        image.naturalWidth,
        image.naturalHeight,
        0,
        0,
        image.naturalWidth,
        image.naturalHeight,
      );

      ctx.restore();

      return new Promise((resolve) => {
        canvas.toBlob(resolve, 'image/jpeg', 0.9);
      });
    },
    []
  );

  const handleCropSave = useCallback(async () => {
    if (!imgRef.current || !completedCrop) {
      toast({
        title: 'Error',
        description: 'Please select a crop area first',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);
    try {
      const croppedImageBlob = await getCroppedImg(imgRef.current, completedCrop, scale, rotate);
      if (croppedImageBlob) {
        const fileName = `cropped_${Date.now()}_${imageName}`;
        await onCropComplete(croppedImageBlob, fileName);
        onClose();
      } else {
        throw new Error('Failed to create cropped image');
      }
    } catch (error: any) {
      console.error('Error creating cropped image:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to crop image',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  }, [completedCrop, scale, rotate, getCroppedImg, onCropComplete, onClose, imageName, toast]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crop Image - {imageName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Aspect Ratio Controls */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={aspect === 16 / 9 ? "default" : "outline"}
              size="sm"
              onClick={() => setAspect(16 / 9)}
            >
              16:9
            </Button>
            <Button
              variant={aspect === 4 / 3 ? "default" : "outline"}
              size="sm"
              onClick={() => setAspect(4 / 3)}
            >
              4:3
            </Button>
            <Button
              variant={aspect === 1 ? "default" : "outline"}
              size="sm"
              onClick={() => setAspect(1)}
            >
              1:1
            </Button>
            <Button
              variant={aspect === undefined ? "default" : "outline"}
              size="sm"
              onClick={() => setAspect(undefined)}
            >
              Free
            </Button>
          </div>

          {/* Crop Area */}
          <div className="flex justify-center">
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspect}
              minWidth={50}
              minHeight={50}
              className="max-w-full"
            >
              <img
                ref={imgRef}
                alt="Crop me"
                src={imageUrl}
                style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
                onLoad={onImageLoad}
                className="max-w-full max-h-96 object-contain"
              />
            </ReactCrop>
          </div>

          {/* Preview Canvas (hidden) */}
          <canvas
            ref={canvasRef}
            className="hidden"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button onClick={handleCropSave} disabled={!completedCrop || isProcessing}>
            {isProcessing ? 'Processing...' : 'Crop & Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}