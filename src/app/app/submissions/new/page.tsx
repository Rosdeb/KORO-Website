"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  LayoutGrid,
  Languages,
  Loader2,
  Quote,
  Send,
  Sparkles,
  StickyNote,
  Volume2,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useLanguages } from "@/features/languages/hooks";
import { useCategories } from "@/features/dictionary/hooks";
import { useCreateSubmission } from "@/features/submissions/hooks";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/features/i18n/context";

const schema = z.object({
  categoryId: z.string().min(1, "Select a category"),
  sourceLanguageId: z.string().min(1, "Select the source language"),
  sourceWord: z.string().min(1, "Enter the word in the source language"),
  banglaTranslation: z.string().min(1, "Bangla meaning is required"),
  englishTranslation: z.string().min(1, "English meaning is required"),
  pronunciation: z.string().optional(),
  exampleSentence: z.string().optional(),
  note: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function NewSubmissionPage() {
  const { t } = useI18n();
  const { data: languages } = useLanguages();
  const { data: categories } = useCategories();
  const createSubmission = useCreateSubmission();
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [preview, setPreview] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [translatingField, setTranslatingField] = useState<"bangla" | "english" | null>(null);
  const [lastEdited, setLastEdited] = useState<{ field: "bn" | "en"; text: string } | null>(null);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    getValues,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      categoryId: "",
      sourceLanguageId: "",
      sourceWord: "",
      banglaTranslation: "",
      englishTranslation: "",
      pronunciation: "",
      exampleSentence: "",
      note: "",
    },
  });

  useEffect(() => {
    if (!lastEdited || !lastEdited.text.trim()) {
      setTranslatingField(null);
      return;
    }

    const { field, text } = lastEdited;
    const target = field === "bn" ? "english" : "bangla";
    setTranslatingField(target);

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: text.trim(),
            from: field,
            to: field === "bn" ? "en" : "bn",
          }),
          signal: controller.signal,
        });

        if (res.ok) {
          const data = await res.json();
          if (data.translatedText) {
            if (field === "bn") {
              setValue("englishTranslation", data.translatedText, {
                shouldValidate: true,
                shouldDirty: true,
              });
            } else {
              setValue("banglaTranslation", data.translatedText, {
                shouldValidate: true,
                shouldDirty: true,
              });
            }
          }
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Auto-translate error:", err);
        }
      } finally {
        setTranslatingField((curr) => (curr === target ? null : curr));
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [lastEdited, setValue]);

  async function onSubmit(values: FormValues) {
    setFormError(null);
    try {
      await createSubmission.mutateAsync(values);
      setSubmitted(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError("sourceWord", { message: "This word has already been submitted or exists in the dictionary." });
        setFormError(err.message);
        return;
      }
      setFormError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (submitted) {
    return (
      <Card className="mx-auto max-w-lg">
        <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="size-6 text-success" />
          </div>
          <h2 className="text-lg font-semibold">{t("suggest.successTitle")}</h2>
          <p className="text-sm text-muted-foreground">{t("suggest.successSubtitle")}</p>
          <div className="mt-2 flex w-full flex-col sm:flex-row gap-2">
            <Button variant="outline" className="w-full" onClick={() => router.push("/app/submissions")}>
              {t("suggest.viewSubmissions")}
            </Button>
            <Button className="w-full" onClick={() => setSubmitted(false)}>{t("suggest.suggestAnother")}</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const categoryName = categories?.find((c) => c.id === getValues("categoryId"))?.name;
  const sourceLanguageName = languages?.find((l) => l.id === getValues("sourceLanguageId"))?.name;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 sm:gap-6 pb-6">
      <Link
        href="/app/submissions"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground active:scale-95"
      >
        <ArrowLeft className="size-4" /> {t("suggest.mySubmissions")}
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("suggest.title")}</h1>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
          {t("suggest.desc")}
        </p>
      </div>

      <Card className="border-border/70 shadow-sm">
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 sm:gap-6">
            {formError && (
              <p className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">{formError}</p>
            )}

            <FormSection title={t("suggest.step1")}>
              <IconField
                label={t("suggest.category")}
                required
                icon={<LayoutGrid className="size-4" />}
                iconClassName="bg-primary-100 text-primary-700"
                helper={t("suggest.categoryHelper")}
                error={errors.categoryId?.message}
              >
                <Controller
                  control={control}
                  name="categoryId"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="pl-12 text-base sm:text-sm h-11">
                        <SelectValue placeholder={t("suggest.selectCategory")} />
                      </SelectTrigger>
                      <SelectContent>
                        {(categories ?? []).map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </IconField>
            </FormSection>

            <FormSection
              title={t("suggest.step2")}
              description={t("suggest.step2Desc")}
            >
              <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-primary">
                <Sparkles className="size-4 shrink-0 text-primary" />
                <span className="leading-tight">
                  <strong>{t("suggest.smartAutoFill")}</strong> {t("suggest.autoTranslateHint")}
                </span>
              </div>

              <IconField
                label={t("suggest.sourceLanguage")}
                required
                icon={<Languages className="size-4" />}
                iconClassName="bg-success/10 text-success"
                helper={t("suggest.sourceLanguageHelper")}
                error={errors.sourceLanguageId?.message}
              >
                <Controller
                  control={control}
                  name="sourceLanguageId"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="pl-12 text-base sm:text-sm h-11">
                        <SelectValue placeholder={t("suggest.selectSourceLanguage")} />
                      </SelectTrigger>
                      <SelectContent>
                        {(languages ?? []).map((l) => (
                          <SelectItem key={l.id} value={l.id}>
                            {l.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </IconField>

              <IconField
                label={t("suggest.word")}
                required
                icon={<Quote className="size-4" />}
                iconClassName="bg-primary/10 text-primary"
                helper={t("suggest.wordHelper")}
                error={errors.sourceWord?.message}
                showClear={Boolean(watch("sourceWord"))}
                onClear={() => setValue("sourceWord", "", { shouldValidate: true, shouldDirty: true })}
              >
                <Controller
                  control={control}
                  name="sourceWord"
                  render={({ field }) => (
                    <Input
                      className="pl-12 pr-11 text-base sm:text-sm h-11"
                      placeholder={t("suggest.wordPlaceholder")}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </IconField>

              <IconField
                label={t("suggest.bangla")}
                required
                icon={<span className="text-sm">🇧🇩</span>}
                iconClassName="bg-success/10"
                helper={
                  translatingField === "bangla"
                    ? t("suggest.banglaTranslating")
                    : t("suggest.banglaHelper")
                }
                isLoading={translatingField === "bangla"}
                showClear={Boolean(watch("banglaTranslation"))}
                onClear={() => {
                  setValue("banglaTranslation", "", { shouldValidate: true, shouldDirty: true });
                  setLastEdited(null);
                  setTranslatingField(null);
                }}
                error={errors.banglaTranslation?.message}
              >
                <Controller
                  control={control}
                  name="banglaTranslation"
                  render={({ field }) => (
                    <Input
                      className="pl-12 pr-11 text-base sm:text-sm h-11"
                      placeholder={t("suggest.banglaPlaceholder")}
                      value={field.value}
                      onChange={(e) => {
                        field.onChange(e);
                        setLastEdited({ field: "bn", text: e.target.value });
                      }}
                    />
                  )}
                />
              </IconField>

              <IconField
                label={t("suggest.english")}
                required
                icon={<span className="text-sm">🇺🇸</span>}
                iconClassName="bg-primary-100"
                helper={
                  translatingField === "english"
                    ? t("suggest.englishTranslating")
                    : t("suggest.englishHelper")
                }
                isLoading={translatingField === "english"}
                showClear={Boolean(watch("englishTranslation"))}
                onClear={() => {
                  setValue("englishTranslation", "", { shouldValidate: true, shouldDirty: true });
                  setLastEdited(null);
                  setTranslatingField(null);
                }}
                error={errors.englishTranslation?.message}
              >
                <Controller
                  control={control}
                  name="englishTranslation"
                  render={({ field }) => (
                    <Input
                      className="pl-12 pr-11 text-base sm:text-sm h-11"
                      placeholder={t("suggest.englishPlaceholder")}
                      value={field.value}
                      onChange={(e) => {
                        field.onChange(e);
                        setLastEdited({ field: "en", text: e.target.value });
                      }}
                    />
                  )}
                />
              </IconField>
            </FormSection>

            <FormSection title={t("suggest.step3")}>
              <IconField
                label={t("suggest.pronunciation")}
                icon={<Volume2 className="size-4" />}
                iconClassName="bg-accent-100 text-accent"
                helper="e.g., pa-ni"
              >
                <Input
                  className="pl-12 text-base sm:text-sm h-11"
                  placeholder={t("suggest.pronunciationPlaceholder")}
                  {...register("pronunciation")}
                />
              </IconField>

              <IconField
                label={t("suggest.example")}
                icon={<Quote className="size-4" />}
                iconClassName="bg-accent-100 text-accent"
                helper={t("suggest.exampleHelper")}
              >
                <Input
                  className="pl-12 text-base sm:text-sm h-11"
                  placeholder={t("suggest.examplePlaceholder")}
                  {...register("exampleSentence")}
                />
              </IconField>

              <IconField
                label={t("suggest.note")}
                icon={<StickyNote className="size-4" />}
                iconClassName="bg-accent-100 text-accent"
                helper={t("suggest.noteHelper")}
              >
                <Input
                  className="pl-12 text-base sm:text-sm h-11"
                  placeholder={t("suggest.notePlaceholder")}
                  {...register("note")}
                />
              </IconField>
            </FormSection>

            <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 border-t border-border pt-5">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto h-11 text-sm font-medium"
                onClick={() => setPreview(true)}
              >
                <Eye className="size-4" /> {t("suggest.preview")}
              </Button>
              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto h-11 text-sm"
                  onClick={() => router.push("/app/submissions")}
                >
                  {t("suggest.cancel")}
                </Button>
                <Button
                  type="submit"
                  loading={isSubmitting}
                  className="w-full sm:w-auto h-11 text-sm font-semibold shadow-sm"
                >
                  <Send className="size-4" /> {t("suggest.submit")}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <Dialog open={preview} onOpenChange={setPreview}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-lg rounded-2xl p-5 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">{getValues("sourceWord") || t("suggest.newWord")}</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              {categoryName ?? t("suggest.noCategory")} · {sourceLanguageName ?? t("suggest.noSourceLang")}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2.5 text-xs sm:text-sm">
            <PreviewRow label={t("suggest.bangla")} value={getValues("banglaTranslation")} />
            <PreviewRow label={t("suggest.english")} value={getValues("englishTranslation")} />
            <PreviewRow label={t("suggest.pronunciation")} value={getValues("pronunciation")} />
            <PreviewRow label={t("suggest.example")} value={getValues("exampleSentence")} />
            <PreviewRow label={t("suggest.note")} value={getValues("note")} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3.5 sm:gap-4 border-t border-border pt-4 sm:pt-5 first:border-t-0 first:pt-0">
      <div>
        <h2 className="text-sm font-semibold">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
      </div>
      {children}
    </div>
  );
}

function IconField({
  label,
  required,
  icon,
  iconClassName,
  helper,
  error,
  isLoading,
  showClear,
  onClear,
  children,
}: {
  label: string;
  required?: boolean;
  icon: React.ReactNode;
  iconClassName?: string;
  helper?: string;
  error?: string;
  isLoading?: boolean;
  showClear?: boolean;
  onClear?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs sm:text-sm font-medium">
        {label} {required && <span className="text-danger">*</span>}
      </Label>
      <div className="relative">
        <span
          className={cn(
            "pointer-events-none absolute left-2.5 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-lg text-sm",
            iconClassName,
          )}
        >
          {icon}
        </span>
        {children}
        {isLoading ? (
          <span className="pointer-events-none absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center gap-1.5 rounded-full bg-background/90 px-2 py-0.5 text-xs font-medium text-primary shadow-xs animate-pulse">
            <Loader2 className="size-3.5 animate-spin" />
            <span className="hidden sm:inline">Auto-translating...</span>
          </span>
        ) : showClear && onClear ? (
          <button
            type="button"
            tabIndex={-1}
            onClick={onClear}
            className="absolute right-1.5 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-all active:scale-90 hover:bg-muted hover:text-foreground touch-manipulation"
            title="Clear text"
            aria-label="Clear text"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>
      {helper && !error && <p className="text-[11px] sm:text-xs text-muted-foreground">{helper}</p>}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

function PreviewRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg bg-muted/60 px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value?.trim() || "—"}</span>
    </div>
  );
}
