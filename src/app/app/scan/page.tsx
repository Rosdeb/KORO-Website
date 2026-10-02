"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  Camera,
  ImagePlus,
  Loader2,
  RotateCcw,
  History,
  Sparkles,
  Lightbulb,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ErrorState } from "@/components/state/error-state";
import { SaveToBookButton } from "@/components/save-to-book/save-to-book-button";
import { useRecognizeImage } from "@/features/scan/hooks";
import { useI18n } from "@/features/i18n/context";
import { scriptClassFor } from "@/lib/utils/script-font";
import { cn } from "@/lib/utils/cn";

export default function ScanPage() {
  const { t } = useI18n();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const recognize = useRecognizeImage();

  function handleFile(file: File | undefined) {
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    recognize.mutate(file);
  }

  function reset() {
    setPreviewUrl(null);
    recognize.reset();
    if (cameraInputRef.current) cameraInputRef.current.value = "";
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleFile(file);
    }
  };

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-5 sm:gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {t("scan.title")}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            {t("scan.subtitle")}
          </p>
        </div>
        <Link
          href="/app/scan/history"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-xs transition-colors hover:bg-muted"
        >
          <History className="size-3.5 text-primary" />
          <span>{t("scan.history")}</span>
        </Link>
      </div>

      {/* Hidden Inputs for Direct Camera vs Gallery Picker */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {/* Upload & Capture State */}
      {!previewUrl && (
        <div className="flex flex-col gap-4">
          <Card
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "relative overflow-hidden border-2 border-dashed transition-all duration-200",
              isDragging
                ? "border-primary bg-primary/5 scale-[0.99]"
                : "border-border/80 hover:border-primary/50 bg-card/60"
            )}
          >
            <CardContent className="flex flex-col items-center p-6 text-center sm:p-10">
              {/* Central Camera / Lens Visual */}
              <div className="relative mb-5 flex size-20 items-center justify-center rounded-3xl bg-primary/10 text-primary ring-8 ring-primary/5 sm:size-24">
                <Camera className="size-9 sm:size-11 stroke-[1.75]" />
                <div className="absolute -right-1 -top-1 rounded-full bg-primary p-1 text-primary-foreground shadow-xs">
                  <Sparkles className="size-3.5" />
                </div>
              </div>

              <h2 className="text-base font-semibold sm:text-lg">
                {t("scan.dropzoneTitle")}
              </h2>
              <p className="mt-1 max-w-sm text-xs text-muted-foreground sm:text-sm">
                {t("scan.uploadDesc")}
              </p>

              {/* Mobile Action Buttons */}
              <div className="mt-6 flex w-full flex-col gap-2.5 sm:flex-row sm:gap-3">
                {/* Take Photo Button - Camera Direct */}
                <Button
                  size="lg"
                  onClick={() => cameraInputRef.current?.click()}
                  className="group relative h-12 flex-1 gap-2.5 rounded-xl font-semibold shadow-md active:scale-[0.98] sm:h-11"
                >
                  <Camera className="size-4.5 transition-transform group-hover:scale-110" />
                  <span>{t("scan.takePhoto")}</span>
                </Button>

                {/* Upload from Gallery Button */}
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => galleryInputRef.current?.click()}
                  className="group h-12 flex-1 gap-2.5 rounded-xl border-border bg-background font-semibold hover:bg-muted active:scale-[0.98] sm:h-11"
                >
                  <ImagePlus className="size-4.5 transition-transform group-hover:scale-110 text-primary" />
                  <span>{t("scan.upload")}</span>
                </Button>
              </div>

              <p className="mt-4 text-[11px] text-muted-foreground/80">
                {t("scan.dropzoneSub")}
              </p>
            </CardContent>
          </Card>

          {/* Helpful Tip */}
          <div className="flex items-start gap-2.5 rounded-2xl border border-border/60 bg-muted/40 p-3.5 text-xs text-muted-foreground">
            <Lightbulb className="size-4 shrink-0 text-amber-500 mt-0.5" />
            <p className="leading-relaxed">{t("scan.tip")}</p>
          </div>
        </div>
      )}

      {/* Captured Image Result & Recognition View */}
      {previewUrl && (
        <Card className="overflow-hidden border-border/80 shadow-md">
          {/* Image Preview Container */}
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/5 sm:aspect-video">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Captured object"
              className="h-full w-full object-contain sm:object-cover"
            />

            {/* Quick Retake Badge Button on top right */}
            <button
              type="button"
              onClick={reset}
              className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-xl bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md transition-transform hover:bg-black/80 active:scale-95"
            >
              <RotateCcw className="size-3.5" />
              <span>{t("scan.scanAnother")}</span>
            </button>
          </div>

          {/* Loading State */}
          {recognize.isPending && (
            <div className="flex flex-col items-center justify-center gap-3 p-8 text-center sm:p-10">
              <Loader2 className="size-7 animate-spin text-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {t("scan.recognizing")}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Running neural visual dictionary lookup
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {recognize.isError && (
            <div className="p-4 sm:p-6">
              <ErrorState onRetry={() => galleryInputRef.current?.click()} />
            </div>
          )}

          {/* Success State */}
          {recognize.isSuccess && (
            <CardContent className="flex flex-col gap-5 p-4 sm:p-6">
              {/* Detected Label & Confidence */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Detected Object
                  </span>
                  <h2 className="text-xl font-bold tracking-tight capitalize text-foreground sm:text-2xl">
                    {recognize.data.detectedLabel}
                  </h2>
                </div>
                <Badge variant="primary" className="gap-1 px-2.5 py-1 text-xs font-semibold">
                  <CheckCircle2 className="size-3.5" />
                  {t("scan.confidence", {
                    count: Math.round(recognize.data.confidence * 100),
                  })}
                </Badge>
              </div>

              {/* No Translations Match */}
              {recognize.data.translations.length === 0 && (
                <div className="rounded-xl border border-border bg-muted/30 p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    {t("scan.noMatch")}
                  </p>
                </div>
              )}

              {/* Translations List */}
              {recognize.data.translations.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold text-muted-foreground">
                    Translations in indigenous languages:
                  </span>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {recognize.data.translations.map((item) => (
                      <div
                        key={item.languageCode}
                        className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/40 px-3.5 py-2.5 transition-colors hover:bg-muted/70"
                      >
                        <span className="text-xs font-medium text-muted-foreground">
                          {item.languageName}
                        </span>
                        <span
                          className={`text-sm font-semibold text-foreground ${scriptClassFor(
                            item.languageCode
                          )}`}
                        >
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Responsive Action Buttons */}
              <div className="flex flex-col gap-2.5 pt-2 sm:flex-row">
                {recognize.data.conceptId &&
                  recognize.data.translations.length > 0 && (
                    <SaveToBookButton
                      concept={{
                        id: recognize.data.conceptId,
                        slug: "",
                        name:
                          recognize.data.conceptName ??
                          recognize.data.detectedLabel,
                        categoryId: "",
                        categoryName: recognize.data.categoryName ?? "",
                        categorySlug: "",
                        translations: recognize.data.translations,
                      }}
                    />
                  )}
                <Button
                  variant="outline"
                  onClick={reset}
                  className="h-11 flex-1 gap-2 rounded-xl border-border bg-card font-medium hover:bg-muted active:scale-[0.98] sm:h-10 sm:flex-none"
                >
                  <RotateCcw className="size-4 text-muted-foreground" />
                  <span>{t("scan.scanAnother")}</span>
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}
