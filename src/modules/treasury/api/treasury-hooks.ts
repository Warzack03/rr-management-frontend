import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateTreasuryChargePayload,
  CreateTreasuryPaymentPayload,
  UpdateTreasuryConfigPayload,
  UpdateTreasuryObligationPayload,
  UpdateTreasuryPersonProfilePayload
} from "../../../shared/types/api";
import {
  createTreasuryCharge,
  createTreasuryPayment,
  deleteTreasuryObligation,
  generateTreasuryBase,
  getTreasuryConfig,
  getTreasuryEconomicBlocks,
  getTreasuryPerson,
  getTreasuryPersons,
  getTreasuryStaffReceivers,
  getTreasurySummary,
  updateTreasuryConfig,
  updateTreasuryObligation,
  updateTreasuryPersonProfile
} from "./treasury-api";

export const treasuryKeys = {
  summary: (seasonId?: number) => ["treasury", "summary", seasonId ?? "default"] as const,
  persons: (seasonId?: number, status?: string, search?: string) =>
    ["treasury", "persons", seasonId ?? "default", status ?? "ALL", search ?? ""] as const,
  person: (personId: string, seasonId?: number) => ["treasury", "person", personId, seasonId ?? "default"] as const,
  config: (seasonId?: number) => ["treasury", "config", seasonId ?? "default"] as const,
  staffReceivers: ["treasury", "staffReceivers"] as const,
  economicBlocks: ["treasury", "economicBlocks"] as const
};

function invalidateTreasury(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["treasury"] });
}

export function useTreasurySummary(seasonId?: number) {
  return useQuery({
    queryKey: treasuryKeys.summary(seasonId),
    queryFn: ({ signal }) => getTreasurySummary(seasonId, signal)
  });
}

export function useTreasuryPersons(params: { seasonId?: number; status?: string; search?: string }) {
  return useQuery({
    queryKey: treasuryKeys.persons(params.seasonId, params.status, params.search),
    queryFn: ({ signal }) => getTreasuryPersons({ ...params, signal })
  });
}

export function useTreasuryPerson(personId: string, seasonId?: number) {
  return useQuery({
    queryKey: treasuryKeys.person(personId, seasonId),
    queryFn: ({ signal }) => getTreasuryPerson(personId, seasonId, signal),
    enabled: personId.length > 0
  });
}

export function useTreasuryConfig(seasonId?: number) {
  return useQuery({
    queryKey: treasuryKeys.config(seasonId),
    queryFn: ({ signal }) => getTreasuryConfig(seasonId, signal)
  });
}

export function useTreasuryStaffReceivers() {
  return useQuery({
    queryKey: treasuryKeys.staffReceivers,
    queryFn: ({ signal }) => getTreasuryStaffReceivers(signal)
  });
}

export function useTreasuryEconomicBlocks() {
  return useQuery({
    queryKey: treasuryKeys.economicBlocks,
    queryFn: ({ signal }) => getTreasuryEconomicBlocks(signal)
  });
}

export function useUpdateTreasuryConfigMutation(seasonId?: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateTreasuryConfigPayload) => updateTreasuryConfig(payload, seasonId),
    onSuccess: () => {
      invalidateTreasury(queryClient);
    }
  });
}

export function useGenerateTreasuryBaseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (seasonId: number) => generateTreasuryBase(seasonId),
    onSuccess: () => {
      invalidateTreasury(queryClient);
    }
  });
}

export function useCreateTreasuryChargeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTreasuryChargePayload) => createTreasuryCharge(payload),
    onSuccess: () => {
      invalidateTreasury(queryClient);
    }
  });
}

export function useCreateTreasuryPaymentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTreasuryPaymentPayload) => createTreasuryPayment(payload),
    onSuccess: () => {
      invalidateTreasury(queryClient);
    }
  });
}

export function useUpdateTreasuryObligationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ obligationId, payload }: { obligationId: number; payload: UpdateTreasuryObligationPayload }) =>
      updateTreasuryObligation(obligationId, payload),
    onSuccess: () => {
      invalidateTreasury(queryClient);
    }
  });
}

export function useDeleteTreasuryObligationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (obligationId: number) => deleteTreasuryObligation(obligationId),
    onSuccess: () => {
      invalidateTreasury(queryClient);
    }
  });
}

export function useUpdateTreasuryPersonProfileMutation(personId: number, seasonId?: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateTreasuryPersonProfilePayload) => updateTreasuryPersonProfile(personId, payload, seasonId),
    onSuccess: () => {
      invalidateTreasury(queryClient);
    }
  });
}
