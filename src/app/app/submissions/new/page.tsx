"use client";

import { useState } from "react";
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
  Quote,
  Send,
  StickyNote,
  Volume2,
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
  const { data: languages } = useLanguages();
  const { data: categories } = useCategories();
  const createSubmission = useCreateSubmission();
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [preview, setPreview] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
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
        <CardContent className="flex flex-col items-center gap-3 pt-6 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="size-6 text-success" />
          </div>
          <h2 className="text-lg font-semibold">Your word has been submitted.</h2>
          <p className="text-sm text-muted-foreground">Status: Pending</p>
          <div className="mt-2 flex gap-2">
            <Button variant="outline" onClick={() => router.push("/app/submissions")}>
              View My Submissions
            </Button>
            <Button onClick={() => setSubmitted(false)}>Suggest Another</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const categoryName = categories?.find((c) => c.id === getValues("categoryId"))?.name;
  const sourceLanguageName = languages?.find((l) => l.id === getValues("sourceLanguageId"))?.name;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <Link
        href="/app/submissions"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> My Submissions
      </Link>

      <div>
        <h1 className="text-2xl font-extrabold sm:text-3xl">Suggest a Translation</h1>
        <p className="mt-1 text-muted-foreground">
          Help grow Koro&apos;s dictionary. Every suggestion is reviewed before it becomes official.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
            {formError && (
              <p className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">{formError}</p>
            )}

            <FormSection title="1. What do you want to translate?">
              <IconField
                label="Category"
                required
                icon={<LayoutGrid className="size-4" />}
                iconClassName="bg-primary-100 text-primary-700"
                helper="Choose the category that best fits this word."
                error={errors.categoryId?.message}
              >
                <Controller
                  control={control}
                  name="categoryId"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="pl-12">
                        <SelectValue placeholder="Select a category" />
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
              title="2. Enter the word and translations"
              description="Fill in all required fields to suggest a new word."
            >
              <IconField
                label="Source Language (Your Language)"
                required
                icon={<Languages className="size-4" />}
                iconClassName="bg-success/10 text-success"
                helper="The language of the word you're adding (e.g., Chakma)."
                error={errors.sourceLanguageId?.message}
              >
                <Controller
                  control={control}
                  name="sourceLanguageId"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="pl-12">
                        <SelectValue placeholder="Select source language" />
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

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="sourceWord">
                  Word (Source Language) <span className="text-danger">*</span>
                </Label>
                <Input
                  id="sourceWord"
                  placeholder="Enter word in source language"
                  {...register("sourceWord")}
                />
                <p className="text-xs text-muted-foreground">e.g., a word in the source language you selected above</p>
                {errors.sourceWord && <p className="text-xs text-danger">{errors.sourceWord.message}</p>}
              </div>

              <IconField
                label="Translation in Bangla"
                required
                icon={<span className="text-sm">🇧🇩</span>}
                iconClassName="bg-success/10"
                helper="e.g., পানি"
                error={errors.banglaTranslation?.message}
              >
                <Input
                  className="pl-12"
                  placeholder="Enter meaning in Bangla"
                  {...register("banglaTranslation")}
                />
              </IconField>

              <IconField
                label="Translation in English"
                required
                icon={<span className="text-sm">🇺🇸</span>}
                iconClassName="bg-primary-100"
                helper="e.g., Water"
                error={errors.englishTranslation?.message}
              >
                <Input
                  className="pl-12"
                  placeholder="Enter meaning in English"
                  {...register("englishTranslation")}
                />
              </IconField>
            </FormSection>

            <FormSection title="3. Additional Information (Optional)">
              <IconField
                label="Pronunciation (Optional)"
                icon={<Volume2 className="size-4" />}
                iconClassName="bg-accent-100 text-accent"
                helper="e.g., pa-ni"
              >
                <Input
                  className="pl-12"
                  placeholder="Enter pronunciation or phonetic spelling"
                  {...register("pronunciation")}
                />
              </IconField>

              <IconField
                label="Example Sentence (Optional)"
                icon={<Quote className="size-4" />}
                iconClassName="bg-accent-100 text-accent"
                helper="Written in the source language, Bangla, or English."
              >
                <Input
                  className="pl-12"
                  placeholder="Use the word in a sentence (any language)"
                  {...register("exampleSentence")}
                />
              </IconField>

              <IconField
                label="Note (Optional)"
                icon={<StickyNote className="size-4" />}
                iconClassName="bg-accent-100 text-accent"
                helper="Add any useful context, usage notes, or etymology."
              >
                <Input
                  className="pl-12"
                  placeholder="Any context that helps a reviewer"
                  {...register("note")}
                />
              </IconField>
            </FormSection>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
              <Button type="button" variant="outline" onClick={() => setPreview(true)}>
                <Eye className="size-4" /> Preview
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => router.push("/app/submissions")}>
                  Cancel
                </Button>
                <Button type="submit" loading={isSubmitting}>
                  <Send className="size-4" /> Submit Suggestion
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <Dialog open={preview} onOpenChange={setPreview}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{getValues("sourceWord") || "New word"}</DialogTitle>
            <DialogDescription>
              {categoryName ?? "No category selected"} · {sourceLanguageName ?? "No source language selected"}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 text-sm">
            <PreviewRow label="Bangla meaning" value={getValues("banglaTranslation")} />
            <PreviewRow label="English meaning" value={getValues("englishTranslation")} />
            <PreviewRow label="Pronunciation" value={getValues("pronunciation")} />
            <PreviewRow label="Example sentence" value={getValues("exampleSentence")} />
            <PreviewRow label="Note" value={getValues("note")} />
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
    <div className="flex flex-col gap-4 border-t border-border pt-5 first:border-t-0 first:pt-0">
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
  children,
}: {
  label: string;
  required?: boolean;
  icon: React.ReactNode;
  iconClassName?: string;
  helper?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>
        {label} {required && <span className="text-danger">*</span>}
      </Label>
      <div className="relative">
        <span
          className={cn(
            "pointer-events-none absolute left-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-lg",
            iconClassName,
          )}
        >
          {icon}
        </span>
        {children}
      </div>
      {helper && !error && <p className="text-xs text-muted-foreground">{helper}</p>}
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
