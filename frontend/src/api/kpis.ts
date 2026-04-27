import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from './client';
import type { KPISummary, ProductKPI, TimeSeriesPoint, SegmentKPI } from '@/types';

export interface KPIFilters {
  product?: string;
  segment?: string;
  period_start?: string;
  period_end?: string;
}

export const useKPISummary = (filters: KPIFilters) =>
  useQuery({
    queryKey: ['kpis', 'summary', filters],
    queryFn: () => apiClient.get<KPISummary>('/kpis/summary', { params: filters }).then((r) => r.data),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

export const useKPIByProduct = (filters: KPIFilters) =>
  useQuery({
    queryKey: ['kpis', 'by-product', filters],
    queryFn: () =>
      apiClient
        .get<ProductKPI[]>('/kpis/by-product', { params: { period_start: filters.period_start, period_end: filters.period_end } })
        .then((r) => r.data),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

export const useKPITimeSeries = (filters: KPIFilters & { granularity?: string }) =>
  useQuery({
    queryKey: ['kpis', 'time-series', filters],
    queryFn: () =>
      apiClient
        .get<{ product: string; granularity: string; series: TimeSeriesPoint[] }>('/kpis/time-series', { params: filters })
        .then((r) => r.data),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

export const useKPIBySegment = (filters: KPIFilters) =>
  useQuery({
    queryKey: ['kpis', 'by-segment', filters],
    queryFn: () =>
      apiClient
        .get<SegmentKPI[]>('/kpis/by-segment', { params: { period_start: filters.period_start, period_end: filters.period_end } })
        .then((r) => r.data),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

export const useExportPDF = () =>
  useMutation({
    mutationFn: async () => {
      const response = await apiClient.post('/kpis/export-pdf', {}, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'notium-kpi-report.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
  });
