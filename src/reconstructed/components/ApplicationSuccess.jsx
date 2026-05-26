import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy, ArrowLeft, RefreshCcw, MessageCircle, CheckCheck, ShieldAlert } from "lucide-react";

export function ApplicationSuccess({
  serviceName,
  applicantName,
  referenceNumber,
  onApplyAnother,
  whatsappHref,
}) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(referenceNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section
      id="application-success"
      className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-20 sm:px-6"
      aria-labelledby="application-success-title"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-24 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-16 right-4 h-72 w-72 rounded-full bg-secondary/15 blur-3xl" />
      </div>

      <motion.div
        className="relative z-10 mx-auto w-full max-w-2xl"
        initial={{ opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="glass-card overflow-hidden rounded-[2.2rem] p-6 text-center shadow-glow sm:p-10">
          <motion.div
            className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-secondary/10 ring-8 ring-secondary/5"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className="grid h-14 w-14 place-items-center rounded-full gradient-bg text-white shadow-glow"
              initial={{ rotate: -18, scale: 0.72 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.25, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <Check className="h-7 w-7" strokeWidth={3.5} />
            </motion.div>
          </motion.div>

          <div className="mx-auto mt-6 max-w-xl">
            <span className="inline-block rounded-full border border-primary/10 bg-primary-soft px-3.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.25em] text-primary">
              Request Registered Successfully
            </span>

            <h2
              id="application-success-title"
              className="mt-5 text-2xl font-black tracking-tight text-foreground sm:text-3xl"
            >
              Hi {applicantName}, Your Request is Registered!
            </h2>

            <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
              Thank you for choosing Apply Seva. We are actively reviewing your details for the{" "}
              <strong className="text-foreground">{serviceName}</strong>.
            </p>
          </div>

          <div className="mx-auto mt-8 max-w-lg rounded-2xl border bg-muted/30 p-4 text-left sm:p-5">
            <div className="flex items-center justify-between gap-4 border-b border-border/80 pb-3">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                  Application Ref
                </span>
                <div className="mt-0.5 font-mono text-sm font-black text-foreground">
                  {referenceNumber}
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className="flex cursor-pointer items-center gap-1.5 rounded-lg border bg-card px-3 py-1.5 text-xs font-bold text-primary shadow-soft transition-all duration-300 hover:border-primary/20 hover:bg-primary-soft"
              >
                {copied ? (
                  <>
                    <CheckCheck className="h-3.5 w-3.5 text-secondary animate-fade-in" />
                    <span className="font-extrabold text-secondary">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Ref</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3 text-xs">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                  Status
                </span>
                <div className="mt-0.5 flex items-center gap-1 font-extrabold text-secondary">
                  <span className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
                  Form Lodged
                </div>
              </div>

              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                  Assigned Agent
                </span>
                <div className="mt-0.5 font-extrabold text-foreground">Desk Agent Assigned</div>
              </div>
            </div>
          </div>

          <div className="mx-auto mt-8 max-w-lg rounded-2xl border bg-card p-5 text-left shadow-soft">
            <h3 className="mb-4 text-xs font-extrabold uppercase tracking-wider text-foreground">
              Real-time Processing Steps
            </h3>

            <div className="relative ml-3 space-y-6 border-l border-border pl-6">
              <div className="relative">
                <div className="absolute -left-[30px] top-0.5 grid h-4 w-4 place-items-center rounded-full bg-secondary text-white shadow-soft">
                  <Check className="h-2.5 w-2.5" strokeWidth={3} />
                </div>
                <h4 className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  Request Registered
                  <span className="rounded bg-secondary-soft px-1.5 py-0.5 text-[9px] font-extrabold text-secondary animate-pulse">
                    DONE
                  </span>
                </h4>
                <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">
                  Your submission is securely logged under ticket {referenceNumber}.
                </p>
              </div>

              <div className="-ml-4 rounded-2xl border border-primary/20 bg-primary-soft/30 p-4 shadow-soft">
                <div className="relative">
                  <div className="absolute -left-[22px] top-[2px] grid h-4 w-4 place-items-center rounded-full bg-primary ring-4 ring-primary-soft">
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                  </div>
                  <h4 className="flex items-center gap-2 text-xs font-extrabold text-foreground">
                    Document Audit in Progress
                    <span className="inline-flex h-2 w-2 rounded-full bg-primary animate-ping" />
                  </h4>
                  <p className="mt-1 text-[10px] font-semibold leading-relaxed text-muted-foreground">
                    An expert officer is verifying your qualification lists and database formatting.
                  </p>
                </div>
              </div>

              <div className="relative pt-1">
                <div className="absolute -left-[30px] top-1.5 grid h-4 w-4 place-items-center rounded-full border border-border bg-muted" />
                <h4 className="text-xs font-bold text-muted-foreground">Government Portal Lodging</h4>
                <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">
                  Data is submitted directly to standard official government APIs.
                </p>
              </div>

              <div className="relative">
                <div className="absolute -left-[30px] top-0.5 grid h-4 w-4 place-items-center rounded-full border border-border bg-muted" />
                <h4 className="text-xs font-bold text-muted-foreground">Acknowledgment Receipt Delivered</h4>
                <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">
                  Official registration card is generated and sent directly to WhatsApp.
                </p>
              </div>
            </div>
          </div>

          <div className="mx-auto mt-8 flex max-w-lg items-start gap-3 rounded-2xl border border-secondary/25 bg-secondary-soft/50 p-4.5 text-left text-xs">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
            <div>
              <h4 className="font-extrabold text-secondary">What happens next?</h4>
              <p className="mt-1 text-[10.5px] leading-relaxed text-muted-foreground">
                Our support desk will verify your details in the next 15-30 minutes. You will receive
                an immediate WhatsApp notification regarding confirmation and fee lodgements. Please keep
                your original documents close by.
              </p>
            </div>
          </div>

          <div className="mx-auto mt-8 grid max-w-lg gap-3 sm:grid-cols-3">
            <a
              href="/#home"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl gradient-bg text-xs font-bold text-white shadow-glow hover:opacity-98"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </a>

            <button
              type="button"
              onClick={onApplyAnother}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card text-xs font-bold shadow-soft hover:bg-muted/40"
            >
              <RefreshCcw className="h-4 w-4" />
              Apply Another
            </button>

            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card text-xs font-bold shadow-soft hover:bg-muted/40"
            >
              <MessageCircle className="h-4 w-4 text-green-500" />
              Get Support
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
