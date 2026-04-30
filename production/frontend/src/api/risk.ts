import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';
import type { RiskMatrixResponse } from '@/types';

export const useRiskMatrix = (period: string = '2024-Q4') =>
  useQuery({
    queryKey: ['risk', 'matrix', period],
    queryFn: () => apiClient.get<RiskMatrixResponse>('/risk/matrix', { params: { period } }).then((r) => r.data),
    staleTime: 10 * 60 * 1000,
    retry: 2,
  });

export const useProductRisk = (productId: string) =>
  useQuery({
    queryKey: ['risk', 'product', productId],
    queryFn: () => apiClient.get(`/risk/product/${productId}`).then((r) => r.data),
    staleTime: 10 * 60 * 1000,
    enabled: !!productId,
    retry: 2,
  });
