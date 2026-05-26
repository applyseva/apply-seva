import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BadgeCheck,
  Check,
  CircleAlert,
  LoaderCircle,
  Shield,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";
import { Toaster, toast } from "sonner";

import { ApplicationSuccess } from "../components/ApplicationSuccess.jsx";
import { OrderSummary } from "../components/OrderSummary.jsx";
import { ProgressStep } from "../components/ProgressStep.jsx";

import { L as LegalTopNav } from "../../../assets/LegalTopNav-DYVhNpqz.js";
import { s as serviceDetails } from "../../../assets/serviceDetails-DMCo3p3v.js";
import {
  n as contact,
  p as slugifyServiceName,
  v as serviceCatalog,
} from "../../../assets/index-BsatwLt-.js";

const SUBMIT_URL =
  "https://script.google.com/macros/s/AKfycbwcDSk47Kbl3J2E1WHKwZZVmiKF1aKVaRGZVco0LBbSwJfCQiaV9G05GEEJIcvBPFCHRQ/exec";

function getServiceFromPath() {
  const slug = window.location.pathname.split("/").filter(Boolean).at(1) ?? "";
  return serviceCatalog.find((service) => slugifyServiceName(service.name) === slug);
}

function fallbackDocuments(serviceName) {
  const detail = serviceDetails[serviceName];
  const firstOpening = detail?.openings?.[0];
  const documentSection = firstOpening?.sections?.find((section) =>
    section.heading.toLowerCase().includes("documents"),
  );

  return (
    documentSection?.items ?? ["Aadhaar Card or ID Proof", "Active Mobile Number", "Email Address"]
  );
}

function normalizeServiceSlug(serviceName) {
  return serviceName
    .toLowerCase()
    .replaceAll("&", "and")
    .replaceAll("/", "-")
    .replaceAll(/\s+/g, "-");
}

export function ServiceApplicationPage() {
  const [submitting, setSubmitting] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successState, setSuccessState] = useState(null);

  const successTimerRef = useRef(null);
  const progressIntervalRef = useRef(null);

  const service = useMemo(() => getServiceFromPath(), []);

  const requiredDocuments = useMemo(() => {
    if (!service) {
      return [];
    }
    return fallbackDocuments(service.name);
  }, [service]);

  useEffect(() => {
    return () => {
      if (successTimerRef.current) {
        window.clearTimeout(successTimerRef.current);
      }
      if (progressIntervalRef.current) {
        window.clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  function handleApplyAnother() {
    window.history.pushState({}, "", "/#services");
    window.dispatchEvent(new PopStateEvent("popstate"));
    requestAnimationFrame(() => document.getElementById("services")?.scrollIntoView());
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!service) {
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      service: service.name,
      name: String(formData.get("name") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      email: String(formData.get("email") ?? ""),
      message: String(formData.get("message") ?? ""),
      couponCode: String(formData.get("couponCode") ?? ""),
      couponDiscount: String(formData.get("couponDiscount") ?? "0"),
      baseAmount: String(formData.get("baseAmount") ?? String(service.price ?? 0)),
      finalAmount: String(formData.get("finalAmount") ?? String(service.price ?? 0)),
    };

    const normalizedPhone = payload.phone.replace(/\D/g, "").slice(-10);
    if (!/^[6-9]\d{9}$/.test(normalizedPhone)) {
      toast.error("Please enter a valid Indian mobile number");
      return;
    }

    setSubmitting(true);
    setProgressStep(0);

    const submissionReady = { current: false };
    const responseRef = { current: null };
    let currentStep = 0;

    progressIntervalRef.current = window.setInterval(() => {
      currentStep += 1;
      setProgressStep(currentStep);

      if (currentStep >= 3) {
        if (progressIntervalRef.current) {
          window.clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }

        if (submissionReady.current && responseRef.current) {
          finalizeSubmission(form, payload);
        }
      }
    }, 850);

    function finalizeSubmission(currentForm, currentPayload) {
      const referenceNumber = `AS-2026-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      setSuccessState({
        serviceName: service.name,
        applicantName: currentPayload.name,
        referenceNumber,
      });

      toast.success("Application submitted successfully", {
        description: currentPayload.couponCode
          ? `Coupon ${currentPayload.couponCode} applied to this request.`
          : "Preparing your confirmation screen...",
      });

      currentForm.reset();

      successTimerRef.current = window.setTimeout(() => {
        setShowSuccess(true);
        setSubmitting(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 650);
    }

    try {
      const response = await fetch(
        `${SUBMIT_URL}?service=${encodeURIComponent(normalizeServiceSlug(service.name))}`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        throw new Error(`Application request failed with ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        responseRef.current = result;
        submissionReady.current = true;
        if (currentStep >= 3) {
          finalizeSubmission(form, payload);
        }
      } else {
        if (progressIntervalRef.current) {
          window.clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
        setSubmitting(false);
        toast.error(result.message || "Something went wrong");
      }
    } catch (error) {
      console.error(error);
      if (progressIntervalRef.current) {
        window.clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setSubmitting(false);
      toast.error("Failed to submit application");
    }
  }

  if (!service) {
    return (
      <main className="min-h-screen bg-background px-4 pt-28 text-foreground">
        <LegalTopNav />
        <div className="mx-auto max-w-xl rounded-2xl border bg-card p-6 text-center shadow-soft">
          <h1 className="text-2xl font-extrabold">Service form not found</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            The selected service application form could not be found.
          </p>
          <a className="mt-5 inline-flex rounded-xl gradient-bg px-5 py-3 font-bold text-white" href="/#services">
            Choose a service
          </a>
        </div>
        <Toaster position="top-center" richColors />
      </main>
    );
  }

  if (showSuccess && successState) {
    return (
      <>
        <ApplicationSuccess
          serviceName={successState.serviceName}
          applicantName={successState.applicantName}
          referenceNumber={successState.referenceNumber}
          onApplyAnother={handleApplyAnother}
          whatsappHref={contact.whatsappHref}
        />
        <Toaster position="top-center" richColors />
      </>
    );
  }

  const servicePriceLabel = service.price === 0 ? "Free" : `₹${service.price}`;

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-background text-foreground">
      <LegalTopNav />

      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[500px] bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.06),transparent_50%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.06),transparent_50%)]" />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 px-4 pb-16 pt-28 sm:px-6 lg:px-8">
        <div className="w-full">
          <div className="mb-6 flex items-center justify-between">
            <a
              href="/#services"
              className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-xs font-bold text-primary shadow-soft transition-all duration-300 hover:border-primary/20 hover:bg-primary-soft"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to services
            </a>

            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground sm:text-xs">
              <span>Services</span>
              <span>/</span>
              <span className="font-bold text-foreground">{service.name}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
            <aside className="flex w-full flex-col gap-6 lg:col-span-4 lg:sticky lg:top-24">
              <div className="overflow-hidden rounded-[1.8rem] border bg-card p-6 shadow-soft">
                <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-primary">
                  <Shield className="h-3 w-3" />
                  Secure Portal
                </div>

                <h1 className="text-2xl font-black tracking-tight text-foreground">{service.name}</h1>
                <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">{service.description}</p>

                <div className="mt-5 flex items-center justify-between border-t border-border/80 pt-4">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Service Fee
                    </div>
                    <div className="mt-0.5 text-xl font-black text-secondary">{servicePriceLabel}</div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Timeline
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-xs font-extrabold text-foreground">
                      <BadgeCheck className="h-3.5 w-3.5 text-primary" />
                      24-48 Hours
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.8rem] border bg-card p-6 shadow-soft">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-extrabold text-foreground">
                  <UserRoundCheck className="h-4.5 w-4.5 text-primary" />
                  Required Documents
                </h3>

                <ul className="space-y-3">
                  {requiredDocuments.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                      <span className="text-xs font-semibold leading-normal text-muted-foreground">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-4.5 flex items-start gap-2 rounded-xl border border-primary/10 bg-primary-soft p-3 text-[10px] font-semibold leading-relaxed text-primary">
                  <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  <span>Clear photos/scans will be requested via WhatsApp after review.</span>
                </div>
              </div>

              <div className="rounded-[1.8rem] border bg-card p-6 shadow-soft">
                <h3 className="mb-5 flex items-center gap-2 text-sm font-extrabold text-foreground">
                  <ShieldCheck className="h-4.5 w-4.5 text-secondary" />
                  Application Stages
                </h3>

                <div className="relative ml-3 space-y-6 border-l border-border pl-6">
                  <div className="relative">
                    <div className="absolute -left-[30px] top-0.5 grid h-4 w-4 place-items-center rounded-full bg-primary ring-4 ring-primary-soft" />
                    <h4 className="text-xs font-bold text-foreground">Step 1: Application Lodged</h4>
                    <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">
                      Submit your basic contact and messaging details today.
                    </p>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-[30px] top-0.5 grid h-4 w-4 place-items-center rounded-full border border-border bg-muted" />
                    <h4 className="text-xs font-bold text-foreground">Step 2: Agent Assignment</h4>
                    <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">
                      An expert reviews your form and verifies document matches.
                    </p>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-[30px] top-0.5 grid h-4 w-4 place-items-center rounded-full border border-border bg-muted" />
                    <h4 className="text-xs font-bold text-foreground">Step 3: Portal Registration</h4>
                    <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">
                      We securely log details on official departments website.
                    </p>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-[30px] top-0.5 grid h-4 w-4 place-items-center rounded-full border border-border bg-muted" />
                    <h4 className="text-xs font-bold text-foreground">Step 4: Delivery receipt</h4>
                    <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">
                      Official acknowledgment slip sent right to WhatsApp.
                    </p>
                  </div>
                </div>
              </div>
            </aside>

            <section className="w-full lg:col-span-8">
              <div className="overflow-hidden rounded-[2rem] border bg-card p-6 shadow-glow sm:p-8">
                <div className="mb-6 border-b border-border/80 pb-5">
                  <h2 className="text-lg font-black tracking-tight text-foreground">
                    Applicant Information
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Please provide accurate contact details so our agents can reach you.
                  </p>
                </div>

                <form onSubmit={handleSubmit} aria-busy={submitting} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="application-service"
                        className="mb-2 block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground"
                      >
                        Selected Service
                      </label>
                      <input
                        id="application-service"
                        required
                        readOnly
                        name="service"
                        value={service.name}
                        className="h-11 cursor-not-allowed rounded-xl border border-border bg-muted/50 px-4 text-sm font-bold text-muted-foreground focus:border-border focus:ring-0"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="application-name"
                        className="mb-2 block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground"
                      >
                        Your Full Name
                      </label>
                      <input
                        id="application-name"
                        placeholder="e.g. Rahul Kumar"
                        required
                        name="name"
                        autoComplete="name"
                        className="h-11 rounded-xl border border-border/80 bg-card px-4 text-sm font-semibold outline-none transition-all duration-300 focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/10"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="application-phone"
                        className="mb-2 block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground"
                      >
                        Mobile Number (WhatsApp Preferred)
                      </label>
                      <input
                        id="application-phone"
                        required
                        name="phone"
                        placeholder="e.g. 9500600005"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        className="h-11 rounded-xl border border-border/80 bg-card px-4 text-sm font-semibold outline-none transition-all duration-300 focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/10"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="application-email"
                        className="mb-2 block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground"
                      >
                        Email Address
                      </label>
                      <input
                        id="application-email"
                        required
                        name="email"
                        type="email"
                        placeholder="e.g. rahul.kumar@example.com"
                        autoComplete="email"
                        className="h-11 rounded-xl border border-border/80 bg-card px-4 text-sm font-semibold outline-none transition-all duration-300 focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/10"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="application-message"
                        className="mb-2 block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground"
                      >
                        Additional Messages or Requirements (Optional)
                      </label>
                      <textarea
                        id="application-message"
                        placeholder="Add any specific instructions, correction notes, or certificate names here..."
                        name="message"
                        rows={5}
                        className="resize-none rounded-xl border border-border/80 bg-card p-4 text-sm font-semibold outline-none transition-all duration-300 focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/10"
                      />
                    </div>
                  </div>

                  <OrderSummary service={service} className="mt-6 mb-6" />

                  <div className="border-t border-border/80 pt-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="h-12 w-full cursor-pointer rounded-xl gradient-bg text-sm font-bold text-white shadow-glow transition-all duration-300 hover:opacity-98"
                    >
                      {submitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Submitting Application...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          Submit Secure Application
                          <BadgeCheck className="h-4 w-4" />
                        </span>
                      )}
                    </button>

                    <div className="mt-4 flex items-center justify-center gap-2 text-center text-[10px] font-bold uppercase tracking-wide text-muted-foreground/80">
                      <Shield className="h-4 w-4 shrink-0 text-secondary" />
                      <span>Your personal data is encrypted and 100% private</span>
                    </div>
                  </div>
                </form>
              </div>
            </section>
          </div>
        </div>
      </div>

      {submitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-md">
          <div className="max-w-md w-full rounded-[2rem] border border-border/85 bg-card p-8 text-center shadow-glow animate-fade-in">
            <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center">
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-b-transparent border-l-transparent border-r-transparent border-t-primary"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-2 rounded-full border border-primary/20 bg-primary/10"
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              />
              <LoaderCircle className="relative h-7 w-7 animate-pulse text-primary" />
            </div>

            <h3 className="text-lg font-black tracking-tight text-foreground">
              Processing Secure Application
            </h3>
            <p className="mx-auto mt-2 max-w-[280px] text-xs font-semibold leading-relaxed text-muted-foreground">
              Your details are being encrypted and securely processed using banking-grade security.
            </p>

            <div className="mx-auto mt-8 max-w-xs space-y-4 text-left">
              <ProgressStep
                label="Establishing 256-bit SSL Connection"
                status={progressStep > 0 ? "done" : progressStep === 0 ? "active" : "pending"}
              />
              <ProgressStep
                label="Encrypting personal applicant details"
                status={progressStep > 1 ? "done" : progressStep === 1 ? "active" : "pending"}
              />
              <ProgressStep
                label="Verifying documentation checklist rules"
                status={progressStep > 2 ? "done" : progressStep === 2 ? "active" : "pending"}
              />
              <ProgressStep
                label="Transmitting secure payload"
                status={progressStep > 3 ? "done" : progressStep === 3 ? "active" : "pending"}
              />
            </div>
          </div>
        </div>
      )}

      <Toaster position="top-center" richColors />
    </main>
  );
}
