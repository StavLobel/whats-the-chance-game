/**
 * Unique ID Hooks
 * React hooks for managing unique user IDs
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { uniqueIdApiService, UniqueIdValidationResponse, UniqueIdResponse, User } from '@/lib/uniqueIdApiService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

// Query keys for caching
export const UNIQUE_ID_KEYS = {
  all: ['unique-id'] as const,
  my: () => [...UNIQUE_ID_KEYS.all, 'my'] as const,
  validate: (id: string) => [...UNIQUE_ID_KEYS.all, 'validate', id] as const,
  lookup: (id: string) => [...UNIQUE_ID_KEYS.all, 'lookup', id] as const,
};

/**
 * Hook to get the current user's unique ID
 */
export const useMyUniqueId = () => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: UNIQUE_ID_KEYS.my(),
    queryFn: () => uniqueIdApiService.getMyUniqueId(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on authentication errors
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

/**
 * Hook to validate a unique ID
 */
export const useValidateUniqueId = (uniqueId: string, enabled: boolean = true) => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: UNIQUE_ID_KEYS.validate(uniqueId),
    queryFn: () => uniqueIdApiService.validateUniqueId(uniqueId),
    enabled: enabled && isAuthenticated && Boolean(uniqueId) && uniqueId.length === 16,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on client-side validation errors
      if (error?.response?.status === 400) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

/**
 * Hook to look up a user by unique ID
 */
export const useLookupUserByUniqueId = (uniqueId: string, enabled: boolean = false) => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: UNIQUE_ID_KEYS.lookup(uniqueId),
    queryFn: () => uniqueIdApiService.lookupUserByUniqueId(uniqueId),
    enabled: enabled && isAuthenticated && Boolean(uniqueId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on not found errors
      if (error?.response?.status === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

/**
 * Hook to generate a new unique ID for the current user
 */
export const useGenerateUniqueId = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => uniqueIdApiService.generateUniqueId(),
    onSuccess: (data: UniqueIdResponse) => {
      // Invalidate and refetch the user's unique ID
      queryClient.invalidateQueries({ queryKey: UNIQUE_ID_KEYS.my() });
      
      toast({
        title: 'Success',
        description: data.message,
      });
    },
    onError: (error: any) => {
      const errorMessage = typeof error?.response?.data?.detail === 'string'
        ? error.response.data.detail
        : typeof error?.message === 'string'
        ? error.message
        : 'Failed to generate unique ID';

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook for client-side unique ID validation
 */
export const useUniqueIdValidation = () => {
  const validateFormat = (uniqueId: string) => {
    return uniqueIdApiService.validateUniqueIdFormat(uniqueId);
  };

  const formatForDisplay = (uniqueId: string) => {
    return uniqueIdApiService.formatUniqueIdForDisplay(uniqueId);
  };

  const cleanUniqueId = (uniqueId: string) => {
    return uniqueIdApiService.cleanUniqueId(uniqueId);
  };

  return {
    validateFormat,
    formatForDisplay,
    cleanUniqueId,
  };
};
