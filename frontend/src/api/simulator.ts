import { useMutation } from '@tanstack/react-query';
import { apiClient } from './client';
import type { SimulatorAdjustments, SimulatorResponse } from '@/types';

export const useRunSimulation = () =>
  useMutation({
    mutationFn: (data: { product_id: string; adjustments: SimulatorAdjustments }) =>
      apiClient.post<SimulatorResponse>('/simulator/run', data).then((r) => r.data),
  });

export const useRunSensitivity = () =>
  useMutation({
    mutationFn: (data: { product_id: string; parameter: string; base_adjustments: SimulatorAdjustments }) =>
      apiClient
        .post<{ product_id: string; parameter: string; points: Array<{ parameter_value: number; projected_profit: number }> }>(
          '/simulator/sensitivity',
          data
        )
        .then((r) => r.data),
  });
