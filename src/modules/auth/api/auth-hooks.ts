import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser, login, logout } from "./auth-api";
import { HttpClientError } from "../../../shared/api/http-client";

export const authKeys = {
  me: ["auth", "me"] as const
};

export function useAuthMe() {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: ({ signal }) => getCurrentUser(signal),
    retry: false
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.me, user);
    }
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(authKeys.me, null);
      queryClient.removeQueries({ queryKey: authKeys.me });
    }
  });
}

export function isUnauthorized(error: unknown) {
  return error instanceof HttpClientError && error.status === 401;
}
