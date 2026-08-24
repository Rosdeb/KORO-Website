"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SaveToBookDialog } from "@/components/save-to-book/save-to-book-dialog";
import { useAuth } from "@/features/auth/context";
import type { Concept } from "@/types";

interface SaveToBookButtonProps {
  concept: Concept;
  defaultLanguageCode?: string;
}

export function SaveToBookButton({ concept, defaultLanguageCode }: SaveToBookButtonProps) {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const returnTo = encodeURIComponent(`${pathname}?save=${concept.id}`);

  // Coming back from login/register with ?save=<conceptId> reopens the dialog
  // automatically — this only fires once when auth resolves, so an effect
  // (not derived render state) is the right tool here.
  useEffect(() => {
    if (isAuthenticated && searchParams.get("save") === concept.id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDialogOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <Popover open={gateOpen} onOpenChange={setGateOpen}>
        <PopoverTrigger asChild>
          <Button variant="accent">
            <Bookmark className="size-4" /> Save to Book
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="p-2">
            <p className="font-semibold">Save this word</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create a free account to save words and organize your personal books.
            </p>
            <div className="mt-4 flex gap-2">
              <Button asChild size="sm" className="flex-1">
                <Link href={`/register?returnTo=${returnTo}`}>Create Account</Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="flex-1">
                <Link href={`/login?returnTo=${returnTo}`}>Login</Link>
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <>
      <Button variant={justSaved ? "subtle" : "accent"} onClick={() => setDialogOpen(true)}>
        {justSaved ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
        {justSaved ? "Saved" : "Save to Book"}
      </Button>
      <SaveToBookDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        concept={concept}
        defaultLanguageCode={defaultLanguageCode}
        onSaved={() => setJustSaved(true)}
      />
    </>
  );
}
