/**
 * QR Code Display Component
 * Shows a QR code containing the user's unique ID for easy sharing
 */

import React, { useState } from 'react';
import QRCode from 'qrcode.react';
import { QrCode, Download, Share2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useMyUniqueId } from '@/hooks/useUniqueId';

interface QRCodeDisplayProps {
  className?: string;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ className }) => {
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const { toast } = useToast();

  const { data: uniqueIdData, isLoading } = useMyUniqueId();

  const downloadQRCode = () => {
    if (!uniqueIdData?.unique_id) return;

    try {
      const canvas = document.getElementById('qr-code-canvas') as HTMLCanvasElement;
      if (canvas) {
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `unique-id-qr-${uniqueIdData.unique_id}.png`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
          title: 'Downloaded!',
          description: 'QR code has been saved to your device',
        });
      }
    } catch (error) {
      toast({
        title: 'Download failed',
        description: 'Unable to download QR code',
        variant: 'destructive',
      });
    }
  };

  const shareQRCode = async () => {
    if (!uniqueIdData?.unique_id) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'My Unique ID',
          text: `Add me as a friend using this ID: ${uniqueIdData.unique_id}`,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(uniqueIdData.unique_id);
        toast({
          title: 'Copied to clipboard',
          description: 'Your unique ID has been copied. Share it with friends!',
        });
      }
    } catch (error) {
      toast({
        title: 'Share failed',
        description: 'Unable to share QR code',
        variant: 'destructive',
      });
    }
  };

  if (isLoading || !uniqueIdData?.unique_id) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading QR code...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            QR Code
          </CardTitle>
          <CardDescription>
            Let friends scan this code to add you instantly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* QR Code Preview */}
            <div className="flex justify-center">
              <div className="p-4 bg-white rounded-lg border">
                <QRCode
                  value={uniqueIdData.unique_id}
                  size={120}
                  level="M"
                  includeMargin
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Dialog open={isQRModalOpen} onOpenChange={setIsQRModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1">
                    <QrCode className="w-4 h-4 mr-2" />
                    View Full Size
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>My Unique ID QR Code</DialogTitle>
                    <DialogDescription>
                      Friends can scan this code to add you instantly
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-col items-center space-y-4">
                    {/* Large QR Code */}
                    <div className="p-6 bg-white rounded-lg border">
                      <QRCode
                        id="qr-code-canvas"
                        value={uniqueIdData.unique_id}
                        size={256}
                        level="M"
                        includeMargin
                      />
                    </div>

                    {/* Unique ID Text */}
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-1">Unique ID:</p>
                      <p className="font-mono text-lg font-semibold">
                        {uniqueIdData.unique_id.replace(/(\d{4})(?=\d)/g, '$1 ')}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 w-full">
                      <Button onClick={downloadQRCode} variant="outline" className="flex-1">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button onClick={shareQRCode} variant="outline" className="flex-1">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Help Text */}
            <div className="text-xs text-muted-foreground">
              <p>Friends can scan this code with their phone camera or the app's scanner to add you instantly.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
