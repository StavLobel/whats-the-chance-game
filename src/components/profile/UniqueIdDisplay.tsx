/**
 * Unique ID Display Component
 * Shows the user's unique ID with copy functionality and regeneration option
 */

import React, { useState } from 'react';
import { Copy, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useMyUniqueId, useGenerateUniqueId, useUniqueIdValidation } from '@/hooks/useUniqueId';

interface UniqueIdDisplayProps {
  className?: string;
}

export const UniqueIdDisplay: React.FC<UniqueIdDisplayProps> = ({ className }) => {
  const [isVisible, setIsVisible] = useState(false);
  const { toast } = useToast();
  const { formatForDisplay } = useUniqueIdValidation();

  const { data: uniqueIdData, isLoading, error } = useMyUniqueId();
  const generateUniqueId = useGenerateUniqueId();

  const handleCopyToClipboard = async () => {
    if (!uniqueIdData?.unique_id) return;

    try {
      await navigator.clipboard.writeText(uniqueIdData.unique_id);
      toast({
        title: 'Copied!',
        description: 'Your unique ID has been copied to clipboard',
      });
    } catch (error) {
      toast({
        title: 'Copy failed',
        description: 'Unable to copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  const handleRegenerateId = () => {
    generateUniqueId.mutate();
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const formatIdForDisplay = (id: string) => {
    if (!isVisible) {
      return '•••• •••• •••• ••••';
    }
    return formatForDisplay(id);
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gray-300 rounded animate-pulse" />
            Unique ID
          </CardTitle>
          <CardDescription>Your personal 16-digit identifier for friend requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-8 bg-gray-200 rounded animate-pulse" />
            <div className="flex gap-2">
              <div className="h-9 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-9 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-9 w-24 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading Unique ID</CardTitle>
          <CardDescription>Unable to load your unique ID</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            {error instanceof Error ? error.message : 'An error occurred'}
          </p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
            size="sm"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!uniqueIdData?.unique_id) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Unique ID</CardTitle>
          <CardDescription>Generate your personal identifier for friend requests</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            You don't have a unique ID yet. Generate one to allow friends to find you easily.
          </p>
          <Button 
            onClick={handleRegenerateId}
            disabled={generateUniqueId.isPending}
            className="w-full"
          >
            {generateUniqueId.isPending ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Unique ID'
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Unique ID</span>
          <Badge variant="secondary" className="text-xs">
            {uniqueIdData.message?.includes('generated') ? 'New' : 'Active'}
          </Badge>
        </CardTitle>
        <CardDescription>
          Share this ID with friends so they can send you friend requests
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Unique ID Display */}
          <div className="relative">
            <div className="font-mono text-lg font-semibold p-3 bg-muted rounded-lg border text-center tracking-wider">
              {formatIdForDisplay(uniqueIdData.unique_id)}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={toggleVisibility}
              variant="outline"
              size="sm"
              className="flex-1 min-w-0"
            >
              {isVisible ? (
                <>
                  <EyeOff className="w-4 h-4 mr-2" />
                  Hide
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Show
                </>
              )}
            </Button>

            <Button
              onClick={handleCopyToClipboard}
              variant="outline"
              size="sm"
              className="flex-1 min-w-0"
              disabled={!isVisible}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>

            <Button
              onClick={handleRegenerateId}
              variant="outline"
              size="sm"
              className="flex-1 min-w-0"
              disabled={generateUniqueId.isPending}
            >
              {generateUniqueId.isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Regenerate
                </>
              )}
            </Button>
          </div>

          {/* Help Text */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Friends need this exact 16-digit number to send you requests</p>
            <p>• You can regenerate it anytime, but old IDs won't work anymore</p>
            <p>• Keep it private - only share with people you trust</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
