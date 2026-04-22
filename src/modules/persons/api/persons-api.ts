import type { AddPersonRolesPayload, CreatePersonPayload, Person, UpdatePersonPayload } from "../../../shared/types/api";
import { httpClient } from "../../../shared/api/http-client";

export function getPersons(signal?: AbortSignal) {
  return httpClient<Person[]>("/persons", { signal });
}

export function getPersonById(personId: string, signal?: AbortSignal) {
  return httpClient<Person>(`/persons/${personId}`, { signal });
}

export function createPerson(payload: CreatePersonPayload) {
  return httpClient<Person>("/persons", {
    method: "POST",
    body: payload
  });
}

export function updatePerson(personId: string, payload: UpdatePersonPayload) {
  return httpClient<Person>(`/persons/${personId}`, {
    method: "PUT",
    body: payload
  });
}

export function addPersonRoles(personId: string, payload: AddPersonRolesPayload) {
  return httpClient<Person>(`/persons/${personId}/roles`, {
    method: "POST",
    body: payload
  });
}
