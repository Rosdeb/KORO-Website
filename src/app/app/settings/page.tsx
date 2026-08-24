"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LogOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/features/auth/context";
import { useLanguages } from "@/features/languages/hooks";
import { useUpdateProfile, useChangePassword } from "@/features/profile/hooks";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  nativeLanguage: z.string().optional(),
  preferredLanguage: z.string().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
  });

type ProfileValues = z.infer<typeof profileSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { data: languages } = useLanguages();
  const { toast } = useToast();

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    control: profileControl,
    formState: { errors: profileErrors, isSubmitting: profileSubmitting },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? "",
      nativeLanguage: user?.nativeLanguage ?? "",
      preferredLanguage: user?.preferredLanguage ?? "",
    },
  });

  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors, isSubmitting: passwordSubmitting },
  } = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema) });

  async function onProfileSubmit(values: ProfileValues) {
    try {
      await updateProfile.mutateAsync(values);
      toast({ title: "Profile updated", variant: "success" });
    } catch {
      toast({ title: "Couldn't update profile", description: "Please try again.", variant: "error" });
    }
  }

  async function onPasswordSubmit(values: PasswordValues) {
    try {
      await changePassword.mutateAsync(values);
      toast({ title: "Password changed", variant: "success" });
      resetPasswordForm();
    } catch {
      toast({ title: "Couldn't change password", description: "Check your current password and try again.", variant: "error" });
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <div>
        <h1 className="text-2xl font-extrabold sm:text-3xl">Profile & Settings</h1>
        <p className="mt-1 text-muted-foreground">Manage your account details.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your name and language preferences.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <Avatar className="size-16">
                <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                <AvatarFallback className="text-lg">{user?.name?.slice(0, 1).toUpperCase() ?? "U"}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...registerProfile("name")} />
              {profileErrors.name && <p className="text-xs text-danger">{profileErrors.name.message}</p>}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label>Native language</Label>
                <Controller
                  control={profileControl}
                  name="nativeLanguage"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a language" />
                      </SelectTrigger>
                      <SelectContent>
                        {(languages ?? []).map((l) => (
                          <SelectItem key={l.code} value={l.code}>
                            {l.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Preferred language</Label>
                <Controller
                  control={profileControl}
                  name="preferredLanguage"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a language" />
                      </SelectTrigger>
                      <SelectContent>
                        {(languages ?? []).map((l) => (
                          <SelectItem key={l.code} value={l.code}>
                            {l.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <Button type="submit" loading={profileSubmitting} className="self-start">
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>Change your account password.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="currentPassword">Current password</Label>
              <Input id="currentPassword" type="password" {...registerPassword("currentPassword")} />
              {passwordErrors.currentPassword && (
                <p className="text-xs text-danger">{passwordErrors.currentPassword.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="newPassword">New password</Label>
              <Input id="newPassword" type="password" {...registerPassword("newPassword")} />
              {passwordErrors.newPassword && <p className="text-xs text-danger">{passwordErrors.newPassword.message}</p>}
            </div>
            <Button type="submit" variant="outline" loading={passwordSubmitting} className="self-start">
              Change Password
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator />

      <Button variant="danger" className="self-start" onClick={() => logout()}>
        <LogOut className="size-4" /> Log out
      </Button>
    </div>
  );
}
