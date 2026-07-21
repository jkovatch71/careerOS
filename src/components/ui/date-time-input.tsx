"use client";

import { useRef } from "react";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function DateTimeInput({
  id,
  name,
  defaultValue,
}: {
  id: string;
  name: string;
  defaultValue?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex gap-2">
      <Input
        ref={inputRef}
        id={id}
        name={name}
        type="datetime-local"
        defaultValue={defaultValue}
        className="min-w-0 flex-1"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-9 shrink-0"
        onClick={() => inputRef.current?.blur()}
        aria-label={`Confirm ${name.replaceAll("_", " ")}`}
      >
        <Check className="size-3.5" /> Done
      </Button>
    </div>
  );
}
