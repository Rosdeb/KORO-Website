"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LogOut, User, Lock, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/features/auth/context";
import { useLanguages } from "@/features/languages/hooks";
import { useUpdateProfile, useChangePassword } from "@/features/profile/hooks";
import { useI18n } from "@/features/i18n/context";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  nativeLanguage: z.string().optional(),
  preferredLanguage: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

type ProfileValues = z.infer<typeof profileSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

function SectionHeader({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description?: string }) {
  return (
    <div className="flex items-start gap-3 border-b border-border px-5 py-4">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { t } = useI18n();
  const { user, logout } = useAuth();
  const [passwordOpen, setPasswordOpen] = useState(false);
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
      setPasswordOpen(false);
    } catch {
      toast({ title: "Couldn't change password", description: "Check your current password and try again.", variant: "error" });
    }
  }

  const userInitial = user?.name?.slice(0, 1).toUpperCase() ?? "U";

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 pb-20">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("settings.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("settings.subtitle")}</p>
      </div>

      {/* Identity card */}
      <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5">
        <Avatar className="size-14 shrink-0">
          <AvatarImage src={user?.avatarUrl} alt={user?.name} />
          <AvatarFallback className="text-lg font-semibold">{userInitial}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate font-semibold">{user?.name ?? "—"}</p>
          <p className="truncate text-sm text-muted-foreground">{user?.email ?? "—"}</p>
          {user?.roles?.length ? (
            <p className="mt-1 truncate text-xs text-accent capitalize">
              {user.roles.map(r => r.replace("ROLE_", "").toLowerCase()).join(" · ")}
            </p>
          ) : null}
        </div>
      </div>

      {/* Profile section */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <SectionHeader icon={User} title={t("settings.profile")} description={t("settings.profileDesc")} />
        <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="flex flex-col gap-4 p-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">{t("settings.name")}</Label>
            <Input id="name" {...registerProfile("name")} />
            {profileErrors.name && <p className="text-xs text-danger">{profileErrors.name.message}</p>}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label>{t("settings.nativeLang")}</Label>
              <Controller
                control={profileControl}
                name="nativeLanguage"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder={t("settings.selectLanguage")} /></SelectTrigger>
                    <SelectContent>
                      {(languages ?? []).map((l) => (
                        <SelectItem key={l.code} value={l.code}>{l.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>{t("settings.preferredLang")}</Label>
              <Controller
                control={profileControl}
                name="preferredLanguage"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder={t("settings.selectLanguage")} /></SelectTrigger>
                    <SelectContent>
                      {(languages ?? []).map((l) => (
                        <SelectItem key={l.code} value={l.code}>{l.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
          <div className="flex justify-end border-t border-border pt-4">
            <Button type="submit" loading={profileSubmitting} size="sm">
              {t("settings.saveChanges")}
            </Button>
          </div>
        </form>
      </div>

      {/* Password section */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <button
          type="button"
          className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
          onClick={() => { resetPasswordForm(); setPasswordOpen(o => !o); }}
        >
          <div className="flex items-center gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Lock className="size-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold">{t("settings.password")}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{t("settings.passwordDesc")}</p>
            </div>
          </div>
          {passwordOpen
            ? <ChevronUp className="size-4 shrink-0 text-muted-foreground" />
            : <ChevronDown className="size-4 shrink-0 text-muted-foreground" />}
        </button>
        {passwordOpen && (
          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="flex flex-col gap-4 border-t border-border p-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="currentPassword">{t("settings.currentPassword")}</Label>
              <Input id="currentPassword" type="password" autoComplete="current-password" {...registerPassword("currentPassword")} />
              {passwordErrors.currentPassword && <p className="text-xs text-danger">{passwordErrors.currentPassword.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="newPassword">{t("settings.newPassword")}</Label>
              <Input id="newPassword" type="password" autoComplete="new-password" {...registerPassword("newPassword")} />
              {passwordErrors.newPassword && <p className="text-xs text-danger">{passwordErrors.newPassword.message}</p>}
            </div>
            <div className="flex justify-end border-t border-border pt-4">
              <Button type="submit" loading={passwordSubmitting} size="sm">
                {t("settings.updatePassword")}
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Danger zone */}
      <div className="overflow-hidden rounded-xl border border-danger/30 bg-card">
        <div className="border-b border-danger/20 px-5 py-4">
          <p className="text-sm font-semibold text-danger">Danger zone</p>
        </div>
        <div className="flex items-center justify-between gap-4 px-5 py-4">
          <div>
            <p className="text-sm font-medium">{t("settings.logOut")}</p>
            <p className="text-xs text-muted-foreground">Sign out of your account on this device.</p>
          </div>
          <Button variant="danger" size="sm" onClick={() => logout()}>
            <LogOut className="size-4" /> {t("settings.logOut")}
          </Button>
        </div>
      </div>

    </div>
  );
}
