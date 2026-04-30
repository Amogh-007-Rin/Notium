import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';
import type { ExplanationResponse } from '@/types';

export const useExplanation = (productId: string, month: string) =>
  useQuery({
    queryKey: ['explain', 'month-change', productId, month],
    queryFn: () =>
      apiClient
        .get<ExplanationResponse>('/explain/month-change', { params: { product: productId, month } })
        .then((r) => r.data),
    staleTime: 10 * 60 * 1000,
    enabled: !!productId && !!month,
    retry: 1,
  });
