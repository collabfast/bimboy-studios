import { useEffect, useState } from "react";

const KEY = "bimboy_age_ok";

export function AgeGate() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Allow ?adult=1 query bypass for screenshots / shared dev links.
    if (window.location.search.includes("adult=1")) {
      window.localStorage.setItem(KEY, "1");
      return;
    }
    if (window.localStorage.getItem(KEY) !== "1") setOpen(true);
  }, []);

  if (!open) return null;

  const accept = () => {
    window.localStorage.setItem(KEY, "1");
    setOpen(false);
  };
  const reject = () => {
    window.location.href = "https://www.google.com/";
  };

  return (
    <div className="age-gate-backdrop" role="dialog" aria-modal="true">
      <div className="age-gate-card">
        <div className="age-gate-brand">BIMBOY — SHARE THE FANS AND MONEY YOU DESERVE</div>
        <h2 className="age-gate-title">Adults only</h2>
        <p className="age-gate-body">
          This site contains adult content. You must be at least 18 years old
          (or the age of majority in your jurisdiction) to enter.
        </p>
        <p className="age-gate-fineprint">
          By continuing, you confirm you are of legal age and consent to viewing
          explicit material.
        </p>
        <div className="age-gate-actions">
          <button type="button" className="age-gate-no" onClick={reject}>
            I&apos;m under 18 — exit
          </button>
          <button type="button" className="age-gate-yes" onClick={accept}>
            I&apos;m 18+ — enter
          </button>
        </div>
      </div>
    </div>
  );
}
