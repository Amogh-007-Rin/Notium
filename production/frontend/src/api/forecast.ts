import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';
import type { ForecastResponse, AtRiskProduct } from '@/types';

export const useForecast = (productId: string, horizon: number = 3) =>
  useQuery({
    queryKey: ['forecast', 'predict', productId, horizon],
    queryFn: () =>
      apiClient.get<ForecastResponse>('/forecast/predict', { params: { product: productId, horizon } }).then((r) => r.data),
    staleTime: 10 * 60 * 1000,
    enabled: !!productId,
    retry: 2,
  });

export const useAtRiskProducts = () =>
  useQuery({
    queryKey: ['forecast', 'at-risk'],
    queryFn: () =>
      apiClient.get<{ at_risk_products: AtRiskProduct[] }>('/forecast/at-risk-products').then((r) => r.data.at_risk_products),
    staleTime: 10 * 60 * 1000,
    retry: 2,
  });
