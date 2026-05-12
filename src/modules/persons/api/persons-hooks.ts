import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AddPersonRolesPayload, CreatePersonPayload, UpdatePersonPayload } from "../../../shared/types/api";
import { assignmentsKeys } from "../../assignments/api/assignments-hooks";
import { playerProfileKeys } from "../../player-profiles/api/player-profiles-hooks";
import { addPersonRoles, createPerson, getAllPersons, getInactivePersons, getPersonById, getPersons, updatePerson } from "./persons-api";

export type PersonsScope = "active" | "inactive" | "all";

export const personsKeys = {
  active: ["persons", "active"] as const,
  inactive: ["persons", "inactive"] as const,
  all: ["persons", "all"] as const,
  detail: (personId: string) => ["persons", personId] as const
};

export function usePersons(scope: PersonsScope = "active") {
  return useQuery({
    queryKey: scope === "active" ? personsKeys.active : scope === "inactive" ? personsKeys.inactive : personsKeys.all,
    queryFn: ({ signal }) => {
      if (scope === "inactive") {
        return getInactivePersons(signal);
      }
      if (scope === "all") {
        return getAllPersons(signal);
      }
      return getPersons(signal);
    }
  });
}

export function usePerson(personId: string) {
  return useQuery({
    queryKey: personsKeys.detail(personId),
    queryFn: ({ signal }) => getPersonById(personId, signal),
    enabled: Boolean(personId)
  });
}

export function useCreatePersonMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePersonPayload) => createPerson(payload),
    onSuccess: (person) => {
      queryClient.invalidateQueries({ queryKey: ["persons"] });
      queryClient.setQueryData(personsKeys.detail(String(person.id)), person);
    }
  });
}

export function useAddPersonRolesMutation(personId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddPersonRolesPayload) => addPersonRoles(personId, payload),
    onSuccess: (person) => {
      queryClient.invalidateQueries({ queryKey: ["persons"] });
      queryClient.invalidateQueries({ queryKey: ["assignments", "current"] });
      queryClient.invalidateQueries({ queryKey: ["assignments", "pending"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: playerProfileKeys.detail(personId) });
      queryClient.setQueryData(personsKeys.detail(String(person.id)), person);
    }
  });
}

export function useUpdatePersonMutation(personId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdatePersonPayload) => updatePerson(personId, payload),
    onSuccess: (person) => {
      queryClient.invalidateQueries({ queryKey: ["persons"] });
      queryClient.invalidateQueries({ queryKey: ["assignments", "current"] });
      queryClient.invalidateQueries({ queryKey: ["assignments", "pending"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: playerProfileKeys.detail(personId) });
      queryClient.setQueryData(personsKeys.detail(String(person.id)), person);
    }
  });
}

export function useUpdatePersonByIdMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ personId, payload }: { personId: string; payload: UpdatePersonPayload }) => updatePerson(personId, payload),
    onSuccess: (person) => {
      queryClient.invalidateQueries({ queryKey: ["persons"] });
      queryClient.invalidateQueries({ queryKey: ["assignments", "current"] });
      queryClient.invalidateQueries({ queryKey: ["assignments", "pending"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.setQueryData(personsKeys.detail(String(person.id)), person);
    }
  });
}
