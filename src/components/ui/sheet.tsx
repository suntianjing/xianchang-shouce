import type { ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const Sheet = Dialog.Root;
export const SheetTrigger = Dialog.Trigger;
export const SheetClose = Dialog.Close;

export function SheetContent({
  className,
  children,
  side = "left",
  title,
}: {
  className?: string;
  children: ReactNode;
  side?: "left" | "right";
  title: string;
}) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/40" />
      <Dialog.Content
        className={cn(
          "fixed top-0 z-50 flex h-full w-[min(20rem,92vw)] flex-col bg-paper shadow-(--shadow-border) outline-none",
          side === "left" ? "left-0" : "right-0",
          className,
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-line px-4">
          <Dialog.Title className="font-display text-base">{title}</Dialog.Title>
          <Dialog.Close asChild>
            <Button variant="ghost" size="icon" aria-label="关闭" className="size-10">
              <X className="size-4" />
            </Button>
          </Dialog.Close>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </Dialog.Content>
    </Dialog.Portal>
  );
}
