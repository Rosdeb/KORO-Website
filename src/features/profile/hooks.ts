import { useMutation } from "@tanstack/react-query";
import { profileApi } from "@/lib/api/endpoints";
import type { User } from "@/types";

export function useUpdateProfile(onSuccess?: (user: User) => void) {
  return useMutation({
    mutationFn: profileApi.update,
    onSuccess,
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      profileApi.changePassword(currentPassword, newPassword),
  });
}
