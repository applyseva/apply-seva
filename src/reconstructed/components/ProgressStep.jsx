import { Check, LoaderCircle } from "lucide-react";

export function ProgressStep({ label, status }) {
  return (
    <div className="flex items-center gap-3">
      {status === "done" && (
        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500 text-white">
          <Check className="h-3 w-3 stroke-[3]" />
        </div>
      )}

      {status === "active" && (
        <LoaderCircle className="h-5 w-5 shrink-0 animate-spin text-primary" />
      )}

      {status === "pending" && (
        <div className="h-5 w-5 shrink-0 rounded-full border border-border/80 bg-muted/40" />
      )}

      <span
        className={`text-xs font-semibold transition-colors duration-300 ${
          status === "active"
            ? "text-foreground font-extrabold"
            : status === "done"
              ? "text-muted-foreground/80 font-medium"
              : "text-muted-foreground/50 font-medium"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
