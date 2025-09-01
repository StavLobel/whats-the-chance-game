/**
 * QR Code Scanner Component
 * Allows users to scan QR codes containing unique IDs to add friends
 */

import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, ScanLine, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useValidateUniqueId, useLookupUserByUniqueId, useUniqueIdValidation } from '@/hooks/useUniqueId';

interface QRCodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onUserFound: (user: any) => void;
}

export const QRCodeScanner: React.FC<QRCodeScannerProps> = ({
  isOpen,
  onClose,
  onUserFound,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedId, setScannedId] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();
  const { validateFormat } = useUniqueIdValidation();

  // Validate scanned ID
  const { data: validationData, isLoading: isValidating } = useValidateUniqueId(
    scannedId,
    Boolean(scannedId)
  );

  // Look up user when ID is valid
  const { data: userData, isLoading: isLookingUp } = useLookupUserByUniqueId(
    scannedId,
    Boolean(scannedId && validationData?.valid && validationData?.exists)
  );

  // Handle successful user lookup
  useEffect(() => {
    if (userData && scannedId) {
      onUserFound(userData);
      handleClose();
    }
  }, [userData, scannedId, onUserFound]);

  // Start camera stream
  const startCamera = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setHasPermission(true);
      setIsScanning(true);
    } catch (error) {
      console.error('Camera access error:', error);
      setHasPermission(false);
      setError('Camera access denied. Please allow camera permissions to scan QR codes.');
    }
  };

  // Stop camera stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  // Handle dialog close
  const handleClose = () => {
    stopCamera();
    setScannedId('');
    setError('');
    setHasPermission(null);
    onClose();
  };

  // Simulate QR code scanning (in a real implementation, you'd use a QR code library)
  const simulateScan = (id: string) => {
    const validation = validateFormat(id);
    if (!validation.valid) {
      setError(validation.error || 'Invalid QR code format');
      return;
    }
    setScannedId(id);
  };

  // Start camera when dialog opens
  useEffect(() => {
    if (isOpen && !isScanning) {
      startCamera();
    }
    return () => {
      if (!isOpen) {
        stopCamera();
      }
    };
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanLine className="w-5 h-5" />
            Scan QR Code
          </DialogTitle>
          <DialogDescription>
            Point your camera at a friend's QR code to add them instantly
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Camera View */}
          {hasPermission === null && (
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Camera className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">Requesting camera access...</p>
              </div>
            </div>
          )}

          {hasPermission === false && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Camera access is required to scan QR codes. Please allow camera permissions and try again.
              </AlertDescription>
            </Alert>
          )}

          {hasPermission === true && (
            <div className="relative aspect-square bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
              
              {/* Scanning Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-white rounded-lg relative">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg" />
                  
                  {/* Scanning Line Animation */}
                  <div className="absolute inset-x-2 top-1/2 h-0.5 bg-primary animate-pulse" />
                </div>
              </div>

              {/* Instructions */}
              <div className="absolute bottom-4 left-4 right-4 text-center">
                <p className="text-white text-sm bg-black/50 rounded px-2 py-1">
                  Align QR code within the frame
                </p>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Validation Status */}
          {scannedId && (
            <div className="space-y-2">
              {isValidating && (
                <p className="text-sm text-muted-foreground">Validating ID...</p>
              )}
              
              {validationData && !validationData.valid && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {validationData.error || 'Invalid unique ID'}
                  </AlertDescription>
                </Alert>
              )}

              {validationData?.valid && !validationData.exists && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    This unique ID doesn't belong to any user
                  </AlertDescription>
                </Alert>
              )}

              {validationData?.valid && validationData.exists && isLookingUp && (
                <p className="text-sm text-muted-foreground">Finding user...</p>
              )}
            </div>
          )}

          {/* Test Buttons (for development) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="space-y-2 border-t pt-4">
              <p className="text-xs text-muted-foreground">Development Test:</p>
              <div className="flex gap-2">
                <Button
                  onClick={() => simulateScan('8259255297762312')}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  Test Valid ID
                </Button>
                <Button
                  onClick={() => simulateScan('1234567890123456')}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  Test Invalid ID
                </Button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button onClick={handleClose} variant="outline" className="flex-1">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            {hasPermission === false && (
              <Button onClick={startCamera} className="flex-1">
                <Camera className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
