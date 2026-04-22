import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AddPersonRolesPayload, CreatePersonPayload, UpdatePersonPayload } from "../../../shared/types/api";
import { assignmentsKeys } from "../../assignments/api/assignments-hooks";
import { playerProfileKeys } from "../../player-profiles/api/player-profiles-hooks";
import { addPersonRoles, createPerson, getPersonById, getPersons, updatePerson } from "./persons-api";

export const personsKeys = {
  all: ["persons"] as const,
  detail: (personId: string) => ["persons", personId] as const
};

export function usePersons() {
  return useQuery({
    queryKey: personsKeys.all,
    queryFn: ({ signal }) => getPersons(signal)
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
      queryClient.invalidateQueries({ queryKey: personsKeys.all });
      queryClient.setQueryData(personsKeys.detail(String(person.id)), person);
    }
  });
}

export function useAddPersonRolesMutation(personId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddPersonRolesPayload) => addPersonRoles(personId, payload),
    onSuccess: (person) => {
      queryClient.invalidateQueries({ queryKey: personsKeys.all });
      queryClient.invalidateQueries({ queryKey: assignmentsKeys.current });
      queryClient.invalidateQueries({ queryKey: assignmentsKeys.pending });
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
      queryClient.invalidateQueries({ queryKey: personsKeys.all });
      queryClient.invalidateQueries({ queryKey: assignmentsKeys.current });
      queryClient.invalidateQueries({ queryKey: assignmentsKeys.pending });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: playerProfileKeys.detail(personId) });
      queryClient.setQueryData(personsKeys.detail(String(person.id)), person);
    }
  });
}
