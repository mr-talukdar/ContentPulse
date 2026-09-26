"use client";

import { useEffect, useState } from "react";

export function TokenExhaustedDialog() {
  const [open, setOpen] = useState(false);
  const [offered, setOffered] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    function handleEvent() {
      // Show dialog if not already dismissed in this session
      const dismissed = sessionStorage.getItem("cp_token_dialog_dismissed");
      if (!dismissed) {
        setOpen(true);
      }
    }
    window.addEventListener("contentpulse:token-exhausted", handleEvent);
    return () =>
      window.removeEventListener("contentpulse:token-exhausted", handleEvent);
  }, []);

  function handleDismiss() {
    sessionStorage.setItem("cp_token_dialog_dismissed", "true");
    setOpen(false);
    setOffered(false);
  }

  function handleCopyEmail() {
    navigator.clipboard.writeText("triptokanti2004@gmail.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg border border-red-500/40 bg-zinc-950 p-6 shadow-2xl shadow-red-950/50 sm:p-8">
        {/* Dismiss Button */}
        <button
          onClick={handleDismiss}
          className="absolute right-4 top-4 text-zinc-500 hover:text-zinc-200"
          aria-label="Close dialog">
          ✕
        </button>

        {!offered ? (
          <div>
            {/* Warning Icon & Badge */}
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-red-500/50 bg-red-500/10 text-xl text-red-400">
                ⚡
              </span>
              <div>
                <span className="inline-flex border border-red-500/40 bg-red-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-300">
                  Quota Limit Reached
                </span>
                <h2 className="mt-1 text-lg font-bold text-zinc-100">
                  AI Image Tokens Exhausted!
                </h2>
              </div>
            </div>

            {/* Message Body */}
            <p className="mt-4 text-sm leading-6 text-zinc-300">
              The developer&apos;s free-tier Hugging Face and OpenAI image
              generation tokens have run out while creating high-resolution
              Bengali thriller posters for this demo.
            </p>

            <div className="mt-4 rounded border border-zinc-800 bg-zinc-900/60 p-3 text-xs text-zinc-400">
              <p className="font-semibold text-zinc-300">
                How would you like to proceed?
              </p>
              <ul className="mt-2 space-y-1 list-disc list-inside text-zinc-400">
                <li>
                  <strong className="text-red-300">Offer an Internship:</strong>{" "}
                  Reward the engineer who built this closed-loop AI system.
                </li>
                <li>
                  <strong className="text-zinc-300">
                    Static Demo Library:
                  </strong>{" "}
                  Seamlessly fallback to the 12-asset cinematic Hoichoi artwork.
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setOffered(true)}
                className="flex-1 border border-red-500 bg-linear-to-r from-red-600 to-red-500 px-4 py-3 text-center text-xs font-bold text-white shadow-lg shadow-red-950/40 transition hover:from-red-500 hover:to-red-400">
                💼 Offer Him an Internship ✦
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="flex-1 border border-zinc-700 bg-zinc-900 px-4 py-3 text-center text-xs font-semibold text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-800">
                🎨 Fallback to Demo Library
              </button>
            </div>
          </div>
        ) : (
          /* Celebratory "Offer Sent" View */
          <div className="text-center animate-in fade-in zoom-in-95 duration-200">
            <span className="inline-block text-5xl">🎉</span>
            <span className="mt-3 block border border-green-500/40 bg-green-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-green-300">
              Offer Dispatched!
            </span>
            <h2 className="mt-3 text-xl font-bold text-zinc-100">
              You&apos;ve Made an Outstanding Hire!
            </h2>
            <p className="mt-3 text-sm leading-6 text-zinc-300">
              You just recruited a developer who builds resilient, multi-tiered
              AI content command centers with automatic state machines and
              Bengali-native generation under high-stakes hackathon pressure!
            </p>

            <div className="mt-5 space-y-2 border border-zinc-800 bg-zinc-900/60 p-4 text-xs text-zinc-400">
              <p className="font-semibold text-zinc-200">
                Connect with the developer:
              </p>
              <div className="flex items-center justify-center gap-2">
                <code className="text-red-300">triptokanti2004@gmail.com</code>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="rounded border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-200 hover:border-zinc-500">
                  {copied ? "✓ Copied!" : "Copy"}
                </button>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <a
                href="mailto:triptokanti2004@gmail.com?subject=Internship%20Offer%20from%20Hoichoi%20Hackathon&body=Hi%2C%20we%20loved%20ContentPulse%20and%20want%20to%20offer%20you%20an%20internship!"
                className="flex-1 border border-red-500 bg-red-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-red-500">
                📧 Send Email Offer
              </a>
              <button
                type="button"
                onClick={handleDismiss}
                className="flex-1 border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-800">
                ✨ Continue with Static Demo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
