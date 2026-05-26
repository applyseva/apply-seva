import { useMemo, useState } from "react";
import { BadgeDollarSign, LockKeyhole, ShieldCheck, TimerReset, Undo2 } from "lucide-react";
import { toast } from "sonner";

const COUPONS = {
  SAVE50: { type: "flat", value: 50, label: "Flat Rs50 off" },
  WELCOME10: { type: "percent", value: 10, maxDiscount: 150, label: "10% off up to Rs150" },
  APPLY100: { type: "flat", value: 100, minAmount: 499, label: "Flat Rs100 off on premium services" },
};

function formatCurrency(amount) {
  return amount === 0 ? "Free" : `₹${amount}`;
}

export function OrderSummary({ service, className = "" }) {
  const baseAmount = Number(service.price || 0);
  const isFree = service.price === 0;

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const normalizedCode = couponInput.trim().toUpperCase();
  const coupon = COUPONS[normalizedCode];

  const computedDiscount = useMemo(() => {
    if (!coupon) {
      return 0;
    }

    if (coupon.minAmount && baseAmount < coupon.minAmount) {
      return 0;
    }

    const rawDiscount =
      coupon.type === "percent"
        ? Math.round((baseAmount * coupon.value) / 100)
        : coupon.value;

    return Math.min(rawDiscount, coupon.maxDiscount ?? Infinity, baseAmount);
  }, [baseAmount, coupon]);

  const finalDiscount = appliedCoupon && computedDiscount > 0 ? computedDiscount : 0;
  const finalAmount = Math.max(baseAmount - finalDiscount, 0);

  function applyCoupon() {
    if (isFree || baseAmount <= 0) {
      toast.error("Coupon codes are not available for this service");
      return;
    }

    if (!normalizedCode) {
      toast.error("Please enter a coupon code");
      return;
    }

    if (!coupon) {
      setAppliedCoupon(null);
      toast.error("Invalid coupon code");
      return;
    }

    if (coupon.minAmount && baseAmount < coupon.minAmount) {
      setAppliedCoupon(null);
      toast.error(`This coupon is valid on services above ₹${coupon.minAmount}`);
      return;
    }

    if (computedDiscount <= 0) {
      setAppliedCoupon(null);
      toast.error("This coupon is not applicable to this service");
      return;
    }

    setAppliedCoupon({ code: normalizedCode, ...coupon, discount: computedDiscount });
    toast.success(`Coupon ${normalizedCode} applied`, {
      description: `You saved ₹${computedDiscount}.`,
    });
  }

  function removeCoupon() {
    setCouponInput("");
    setAppliedCoupon(null);
  }

  return (
    <div className={`rounded-2xl border border-border bg-muted/40 p-5 shadow-soft sm:p-6 ${className}`}>
      <input type="hidden" name="couponCode" value={appliedCoupon?.code ?? ""} />
      <input type="hidden" name="couponDiscount" value={String(finalDiscount)} />
      <input type="hidden" name="finalAmount" value={String(finalAmount)} />
      <input type="hidden" name="baseAmount" value={String(baseAmount)} />

      <h4 className="mb-4 flex items-center gap-2 border-b border-border/50 pb-2.5 text-xs font-black uppercase tracking-wider text-foreground">
        <BadgeDollarSign className="h-4 w-4 text-primary" />
        Order Summary
      </h4>

      <div className="mb-4 space-y-3.5 border-b border-border/50 pb-4">
        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
          <span>Service</span>
          <span className="font-bold text-foreground">{service.name}</span>
        </div>

        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
          <span>Apply Seva Platform Fee</span>
          <span className="font-bold text-foreground">{formatCurrency(baseAmount)}</span>
        </div>

        {finalDiscount > 0 && (
          <div className="flex items-center justify-between text-xs font-semibold text-success">
            <span>Coupon ({appliedCoupon.code})</span>
            <span className="font-black">-₹{finalDiscount}</span>
          </div>
        )}

        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
          <span>Government Portal Charges</span>
          <span className="rounded-md bg-secondary-soft px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-secondary-foreground/75">
            Not Included
          </span>
        </div>

        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
          <span>GST</span>
          <span className="font-bold text-foreground">₹0</span>
        </div>
      </div>

      {!isFree && baseAmount > 0 && (
        <div className="mb-5 rounded-2xl border border-dashed border-primary/20 bg-card/80 p-4 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary">
              Coupon Code
            </div>

            {appliedCoupon && (
              <button
                type="button"
                onClick={removeCoupon}
                className="text-[10px] font-bold text-muted-foreground transition-colors hover:text-foreground"
              >
                Remove
              </button>
            )}
          </div>

          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={couponInput}
              onChange={(event) => {
                setCouponInput(event.target.value);
                if (appliedCoupon) {
                  setAppliedCoupon(null);
                }
              }}
              placeholder="Enter coupon code"
              className="h-11 flex-1 rounded-xl border border-border/80 bg-background px-4 text-sm font-semibold uppercase tracking-wide outline-none transition-all duration-300 focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
            />

            <button
              type="button"
              onClick={applyCoupon}
              className="h-11 rounded-xl border border-primary/20 bg-primary px-4 text-xs font-black uppercase tracking-wide text-white shadow-soft transition-all duration-300 hover:opacity-95"
            >
              {appliedCoupon ? "Reapply" : "Apply"}
            </button>
          </div>

          <p className="mt-3 text-[10px] font-semibold leading-relaxed text-muted-foreground">
            {appliedCoupon
              ? `${appliedCoupon.code} active: ${appliedCoupon.label}.`
              : "Try SAVE50, WELCOME10, or APPLY100."}
          </p>
        </div>
      )}

      <div className="mb-5 flex items-center justify-between font-black">
        <span className="text-xs uppercase tracking-wider text-foreground">Total Payable</span>
        <span className="text-xl text-secondary">{formatCurrency(finalAmount)}</span>
      </div>

      <div className="grid grid-cols-1 gap-3 border-t border-border/40 pt-4 sm:grid-cols-2">
        <div className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-card/75 p-2.5 shadow-soft transition-all duration-300 hover:border-primary/20">
          <LockKeyhole className="h-5 w-5 shrink-0 text-secondary" />
          <div className="text-left">
            <p className="text-[10px] font-bold text-foreground">256-Bit SSL Protection</p>
            <p className="text-[8px] font-semibold text-muted-foreground">Your uploads are encrypted</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-card/75 p-2.5 shadow-soft transition-all duration-300 hover:border-primary/20">
          <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
          <div className="text-left">
            <p className="text-[10px] font-bold text-foreground">PCI-DSS Compliant</p>
            <p className="text-[8px] font-semibold text-muted-foreground">100% Safe Checkout</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-card/75 p-2.5 shadow-soft transition-all duration-300 hover:border-primary/20">
          <TimerReset className="h-5 w-5 shrink-0 text-success" />
          <div className="text-left">
            <p className="text-[10px] font-bold text-foreground">Lodged in 24-48 Hours</p>
            <p className="text-[8px] font-semibold text-muted-foreground">Guaranteed processing speed</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-card/75 p-2.5 shadow-soft transition-all duration-300 hover:border-primary/20">
          <Undo2 className="h-5 w-5 shrink-0 text-warning" />
          <div className="text-left">
            <p className="text-[10px] font-bold text-foreground">Refund Assurance</p>
            <p className="text-[8px] font-semibold text-muted-foreground">Fully backed service fee</p>
          </div>
        </div>
      </div>
    </div>
  );
}
