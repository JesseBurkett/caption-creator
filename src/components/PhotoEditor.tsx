
import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Download, Type, Palette, Move } from 'lucide-react';
import { Canvas as FabricCanvas, FabricText, FabricImage } from 'fabric';

interface PhotoEditorProps {
  imageUrl: string;
  caption: string;
  onCaptionChange: (caption: string) => void;
}

export const PhotoEditor: React.FC<PhotoEditorProps> = ({
  imageUrl,
  caption,
  onCaptionChange
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [textObject, setTextObject] = useState<FabricText | null>(null);
  const [fontSize, setFontSize] = useState(24);
  const [textColor, setTextColor] = useState('#ffffff');
  const [backgroundColor, setBackgroundColor] = useState('#000000');
  const [showBackground, setShowBackground] = useState(true);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 600,
      height: 400,
      backgroundColor: '#f8f9fa',
    });

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, []);

  // Load image onto canvas
  useEffect(() => {
    if (!fabricCanvas || !imageUrl) return;

    FabricImage.fromURL(imageUrl).then((img) => {
      fabricCanvas.clear();
      
      // Scale image to fit canvas
      const canvasWidth = fabricCanvas.width || 600;
      const canvasHeight = fabricCanvas.height || 400;
      
      const scaleX = canvasWidth / (img.width || 1);
      const scaleY = canvasHeight / (img.height || 1);
      const scale = Math.min(scaleX, scaleY);
      
      img.scale(scale);
      img.center();
      img.selectable = false;
      img.evented = false;
      
      fabricCanvas.add(img);
      fabricCanvas.renderAll();
      
      // Add text if caption exists
      if (caption) {
        addTextToCanvas(caption);
      }
    });
  }, [fabricCanvas, imageUrl]);

  // Update text when caption changes
  useEffect(() => {
    if (caption && fabricCanvas) {
      if (textObject) {
        textObject.set('text', caption);
        fabricCanvas.renderAll();
      } else {
        addTextToCanvas(caption);
      }
    }
  }, [caption]);

  const addTextToCanvas = (text: string) => {
    if (!fabricCanvas) return;

    // Remove existing text
    if (textObject) {
      fabricCanvas.remove(textObject);
    }

    const newText = new FabricText(text, {
      left: fabricCanvas.width! / 2,
      top: fabricCanvas.height! - 80,
      fontSize: fontSize,
      fill: textColor,
      backgroundColor: showBackground ? backgroundColor : 'transparent',
      fontFamily: 'Arial',
      textAlign: 'center',
      originX: 'center',
      originY: 'center',
      padding: showBackground ? 10 : 0,
    });

    fabricCanvas.add(newText);
    setTextObject(newText);
    fabricCanvas.renderAll();

    // Handle text editing
    newText.on('editing:exited', () => {
      onCaptionChange(newText.text || '');
    });
  };

  // Update text styling
  useEffect(() => {
    if (textObject && fabricCanvas) {
      textObject.set({
        fontSize: fontSize,
        fill: textColor,
        backgroundColor: showBackground ? backgroundColor : 'transparent',
        padding: showBackground ? 10 : 0,
      });
      fabricCanvas.renderAll();
    }
  }, [fontSize, textColor, backgroundColor, showBackground, textObject, fabricCanvas]);

  const downloadImage = () => {
    if (!fabricCanvas) return;

    const dataURL = fabricCanvas.toDataURL({
      format: 'png',
      quality: 1,
    });

    const link = document.createElement('a');
    link.download = 'photo-with-caption.png';
    link.href = dataURL;
    link.click();
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Type className="w-5 h-5 text-blue-500" />
            Photo Editor
          </h2>
          <Button onClick={downloadImage} className="gap-2" disabled={!caption}>
            <Download className="w-4 h-4" />
            Download
          </Button>
        </div>

        <div className="border rounded-lg overflow-hidden bg-gray-50">
          <canvas ref={canvasRef} className="max-w-full" />
        </div>

        {caption && (
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Text Styling
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Font Size</label>
                <Slider
                  value={[fontSize]}
                  onValueChange={([value]) => setFontSize(value)}
                  min={12}
                  max={72}
                  step={2}
                  className="w-full"
                />
                <span className="text-xs text-gray-500">{fontSize}px</span>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Text Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-12 h-8 rounded border"
                  />
                  <span className="text-xs text-gray-500 self-center">{textColor}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  <input
                    type="checkbox"
                    checked={showBackground}
                    onChange={(e) => setShowBackground(e.target.checked)}
                    className="mr-2"
                  />
                  Text Background
                </label>
                {showBackground && (
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-12 h-8 rounded border"
                    />
                    <span className="text-xs text-gray-500 self-center">{backgroundColor}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Move className="w-4 h-4" />
              <span>Click and drag the text to reposition it on your photo</span>
            </div>
          </div>
        )}

        {!caption && (
          <div className="text-center py-8 text-gray-500">
            <Type className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Generate or enter a caption to start editing your photo</p>
          </div>
        )}
      </div>
    </Card>
  );
};
