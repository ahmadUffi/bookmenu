"use client";

import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

type PendingSubmitButtonProps = {
  children: ReactNode;
  className: string;
  pendingText: string;
  disabled?: boolean;
};

export default function PendingSubmitButton({
  children,
  className,
  pendingText,
  disabled = false,
}: PendingSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className={`${className} disabled:cursor-not-allowed disabled:opacity-75 disabled:hover:translate-y-0`}
      disabled={pending || disabled}
      aria-busy={pending}
    >
      {pending ? (
        <>
          <Loader2 size={17} className="animate-spin" />
          {pendingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}
