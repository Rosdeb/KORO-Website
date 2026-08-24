"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguages } from "@/features/languages/hooks";
import { useAllConcepts } from "@/features/dictionary/hooks";
import { useCreateSubmission } from "@/features/submissions/hooks";

const schema = z.object({
  conceptId: z.string().min(1, "Concept is required"),
  languageId: z.string().min(1, "Select a language"),
  suggestedTranslation: z.string().min(1, "Suggested translation is required"),
  pronunciation: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function NewSubmissionPage() {
  const { data: languages } = useLanguages();
  const { data: concepts } = useAllConcepts();
  const createSubmission = useCreateSubmission();
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    await createSubmission.mutateAsync(values);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <Card className="mx-auto max-w-lg">
        <CardContent className="flex flex-col items-center gap-3 pt-6 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="size-6 text-success" />
          </div>
          <h2 className="text-lg font-semibold">Your suggestion has been submitted.</h2>
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

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <Link href="/app/submissions" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
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
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Concept</Label>
              <Controller
                control={control}
                name="conceptId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="e.g. Hello, Water, Mother..." />
                    </SelectTrigger>
                    <SelectContent>
                      {(concepts ?? []).map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.conceptId && <p className="text-xs text-danger">{errors.conceptId.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Target language</Label>
              <Controller
                control={control}
                name="languageId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a language" />
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
              {errors.languageId && <p className="text-xs text-danger">{errors.languageId.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="suggestedTranslation">Suggested translation</Label>
              <Input id="suggestedTranslation" {...register("suggestedTranslation")} />
              {errors.suggestedTranslation && (
                <p className="text-xs text-danger">{errors.suggestedTranslation.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pronunciation">Pronunciation (optional)</Label>
              <Input id="pronunciation" {...register("pronunciation")} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="notes">Note (optional)</Label>
              <Textarea id="notes" placeholder="Any context that helps a reviewer" {...register("notes")} />
            </div>

            <Button type="submit" loading={isSubmitting} className="mt-2 self-start">
              Submit Suggestion
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
