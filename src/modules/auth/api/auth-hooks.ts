import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser, login, logout } from "./auth-api";
import { clearAuthToken, hasAuthToken } from "./auth-token-storage";
import { HttpClientError } from "../../../shared/api/http-client";

export const authKeys = {
  me: ["auth", "me"] as const
};

export function useAuthMe() {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: ({ signal }) => getCurrentUser(signal),
    enabled: hasAuthToken(),
    retry: false
  });
}

export function useLoginMutation() {
  return useMutation({
    mutationFn: login
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      clearAuthToken();
      queryClient.setQueryData(authKeys.me, null);
      queryClient.removeQueries({ queryKey: authKeys.me });
    }
  });
}

export function isUnauthorized(error: unknown) {
  return error instanceof HttpClientError && error.status === 401;
}
