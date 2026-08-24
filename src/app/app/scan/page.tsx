"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Camera, ImagePlus, Loader2, RotateCcw, History } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ErrorState } from "@/components/state/error-state";
import { SaveToBookButton } from "@/components/save-to-book/save-to-book-button";
import { useRecognizeImage } from "@/features/scan/hooks";
import { scriptClassFor } from "@/lib/utils/script-font";

export default function ScanPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const recognize = useRecognizeImage();

  function handleFile(file: File | undefined) {
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    recognize.mutate(file);
  }

  function reset() {
    setPreviewUrl(null);
    recognize.reset();
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl">Scan an Object</h1>
          <p className="mt-1 text-muted-foreground">Point your camera at an object to see its translation.</p>
        </div>
        <Link href="/app/scan/history" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
          <History className="size-4" /> History
        </Link>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {!previewUrl && (
        <Card>
          <div className="flex flex-col items-center gap-4 p-10 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-primary-50 text-primary">
              <Camera className="size-7" />
            </div>
            <p className="text-sm text-muted-foreground">Take a photo or upload an image of an object.</p>
            <div className="flex w-full flex-col gap-2 sm:flex-row">
              <Button className="flex-1" onClick={() => inputRef.current?.click()}>
                <Camera className="size-4" /> Take Photo
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => inputRef.current?.click()}>
                <ImagePlus className="size-4" /> Upload
              </Button>
            </div>
          </div>
        </Card>
      )}

      {previewUrl && (
        <Card className="overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="Captured object" className="aspect-video w-full object-cover" />

          {recognize.isPending && (
            <div className="flex items-center justify-center gap-2 p-6 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Recognizing...
            </div>
          )}

          {recognize.isError && (
            <div className="p-4">
              <ErrorState onRetry={() => inputRef.current?.click()} />
            </div>
          )}

          {recognize.isSuccess && (
            <div className="flex flex-col gap-4 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">{recognize.data.detectedLabel}</h2>
                <Badge variant="primary">Confidence: {Math.round(recognize.data.confidence * 100)}%</Badge>
              </div>

              {recognize.data.translations.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  We couldn&apos;t match this object to a concept yet.
                </p>
              )}

              <div className="flex flex-col gap-3">
                {recognize.data.translations.map((t) => (
                  <div key={t.languageCode} className="flex items-center justify-between rounded-xl bg-muted px-4 py-3">
                    <span className="text-sm text-muted-foreground">{t.languageName}</span>
                    <span className={`font-medium ${scriptClassFor(t.languageCode)}`}>{t.text}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                {recognize.data.conceptId && recognize.data.translations.length > 0 && (
                  <SaveToBookButton
                    concept={{
                      id: recognize.data.conceptId,
                      slug: "",
                      name: recognize.data.conceptName ?? recognize.data.detectedLabel,
                      categoryId: "",
                      categoryName: recognize.data.categoryName ?? "",
                      categorySlug: "",
                      translations: recognize.data.translations,
                    }}
                  />
                )}
                <Button variant="outline" onClick={reset} className="flex-1 sm:flex-none">
                  <RotateCcw className="size-4" /> Scan another
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
