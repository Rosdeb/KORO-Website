import { useMutation } from "@tanstack/react-query";
import { profileApi } from "@/lib/api/endpoints";
import { mapUser } from "@/lib/api/mappers";
import type { User } from "@/types";

export function useUpdateProfile(onSuccess?: (user: User) => void) {
  return useMutation({
    mutationFn: async (payload: Partial<Pick<User, "name" | "avatarUrl" | "nativeLanguage" | "preferredLanguage">>) =>
      mapUser(await profileApi.update(payload)),
    onSuccess,
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      profileApi.changePassword(currentPassword, newPassword),
  });
}
