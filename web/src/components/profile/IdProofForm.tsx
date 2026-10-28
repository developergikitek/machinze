"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

import { Group } from "@/components/equipment/Group";
import { formatDay } from "@/lib/dates";
import { DOC_FILE_TYPES, DOC_TYPES, docSpec, DocType, KYC_KEY, KycRecord, MAX_DOC_BYTES, maskedNumber } from "@/lib/kyc";
import { shakeFields } from "@/lib/shake";
import { writeStored } from "@/lib/useStoredValue";

import { useAccount } from "./useAccount";

type Side = "front" | "back";
type Upload = { file: File; preview?: string };
type Errors = Partial<Record<"number" | "front" | "back" | "consent", string>>;

function formatSize(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function UploadSlot({
  label,
  upload,
  error,
  name,
  onPick,
  onRemove,
}: {
  label: string;
  upload?: Upload;
  error?: string;
  name: Side;
  onPick: (file: File) => void;
  onRemove: () => void;
}) {
  return (
    <div data-field={name}>
      {upload ? (
        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex aspect-[16/10] items-center justify-center bg-[#f6f7f9]">
            {upload.preview ? (
              // eslint-disable-next-line @next/next/no-img-element -- local blob preview
              <img src={upload.preview} alt={`${label} preview`} className="h-full w-full object-cover" />
            ) : (
              <span className="text-[12px] font-semibold text-slate-500">PDF</span>
            )}
          </div>
          <div className="flex items-center justify-between gap-2 px-2.5 py-2">
            <span className="min-w-0">
              <span className="block text-[12px] font-medium text-navy-950">{label}</span>
              <span className="block truncate text-[11px] text-slate-500">{formatSize(upload.file.size)}</span>
            </span>
            <button type="button" onClick={onRemove} className="text-[12px] font-semibold text-red-600">
              Remove
            </button>
          </div>
        </div>
      ) : (
        <label
          className={`flex aspect-[16/10] cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-[1.5px] border-dashed text-center transition ${
            error ? "border-red-300 bg-red-50/40" : "border-slate-300 bg-[#fafbfc] hover:border-slate-400"
          }`}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#111c4e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M4 8.5V7a2 2 0 0 1 2-2h2l1.5-2h5L16 5h2a2 2 0 0 1 2 2v1.5M4 12v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" />
            <circle cx="12" cy="12.5" r="3.5" />
          </svg>
          <span className="text-[13px] font-medium text-navy-950">{label}</span>
          <span className="text-[11px] text-slate-500">Photo or PDF · max 5 MB</span>
          <input
            type="file"
            accept={DOC_FILE_TYPES.join(",")}
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onPick(f);
              e.target.value = "";
            }}
          />
        </label>
      )}
      {error && <p className="mt-1 text-[12px] text-red-500">{error}</p>}
    </div>
  );
}

export default function IdProofForm() {
  const { ready, kyc } = useAccount();
  const [editing, setEditing] = useState(false);
  const [docType, setDocType] = useState<DocType>("aadhaar");
  const [number, setNumber] = useState("");
  const [uploads, setUploads] = useState<Partial<Record<Side, Upload>>>({});
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const previews = useRef<string[]>([]);

  // Blob previews unmount pe free
  useEffect(
    () => () => {
      previews.current.forEach((u) => URL.revokeObjectURL(u));
    },
    [],
  );

  if (!ready) return <div className="m-4 h-[480px] animate-pulse rounded-2xl bg-white" />;

  const spec = docSpec(docType);

  const pick = (side: Side, file: File) => {
    if (!DOC_FILE_TYPES.includes(file.type)) return setErrors((e) => ({ ...e, [side]: "Only JPG, PNG or PDF" }));
    if (file.size > MAX_DOC_BYTES) return setErrors((e) => ({ ...e, [side]: "File must be under 5 MB" }));
    const preview = file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined;
    if (preview) previews.current.push(preview);
    setUploads((u) => ({ ...u, [side]: { file, preview } }));
    setErrors((e) => ({ ...e, [side]: undefined }));
  };

  const changeType = (t: DocType) => {
    setDocType(t);
    setNumber("");
    setUploads((u) => (docSpec(t).needsBack ? u : { front: u.front }));
    setErrors({});
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    if (!spec.valid(number)) next.number = `Enter a valid ${spec.label} number`;
    if (!uploads.front) next.front = "Upload the front side";
    if (spec.needsBack && !uploads.back) next.back = "Upload the back side";
    if (!consent) next.consent = "Please confirm to continue";
    setErrors(next);
    const invalid = Object.keys(next);
    if (invalid.length) return shakeFields(invalid);

    // TODO: KYC API — multipart upload (front/back) + number, server pe verify
    setSubmitting(true);
    setTimeout(() => {
      const record: KycRecord = { status: "pending", docType, last4: number.slice(-4), submittedAt: new Date().toISOString() };
      writeStored("local", KYC_KEY, record);
      setSubmitting(false);
      setEditing(false);
      setNumber("");
      setUploads({});
      setConsent(false);
    }, 1000);
  };

  if (kyc && !editing) {
    const verified = kyc.status === "verified";
    const rejected = kyc.status === "rejected";
    return (
      <div className="space-y-5 px-4 pb-8 pt-4">
        <div className="rounded-2xl bg-white p-5 text-center">
          <span
            className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${
              verified ? "bg-emerald-50 text-emerald-600" : rejected ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
            }`}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              {verified ? <path d="m5 12.5 4.5 4.5L19 7.5" /> : rejected ? <path d="M12 8v5M12 16.5h.01" /> : <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>}
            </svg>
          </span>
          <p className="mt-3 text-[17px] font-semibold text-navy-950">
            {verified ? "ID verified" : rejected ? "Please upload again" : "Under review"}
          </p>
          <p className="mx-auto mt-1 max-w-[280px] text-[13px] text-slate-500">
            {verified
              ? "You're all set for deliveries."
              : rejected
                ? "We couldn't read your document. Upload a clear photo with all corners visible."
                : "We'll notify you once it's verified, usually within 24 hours. You can keep booking meanwhile."}
          </p>
        </div>

        <Group label="Submitted document">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-[14px] text-slate-600">{docSpec(kyc.docType).label}</span>
            <span className="text-[14px] font-medium text-navy-950">{maskedNumber(kyc)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
            <span className="text-[14px] text-slate-600">Submitted</span>
            <span className="text-[14px] font-medium text-navy-950">{formatDay(new Date(kyc.submittedAt))}</span>
          </div>
        </Group>

        <button
          type="button"
          onClick={() => setEditing(true)}
          className="h-[50px] w-full rounded-2xl border border-slate-200 bg-white text-[15px] font-semibold text-navy-950 transition active:scale-[0.98]"
        >
          {rejected ? "Upload again" : "Replace document"}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-6 px-4 pb-8 pt-4">
      <p className="px-1 text-[13px] leading-relaxed text-slate-500">
        Rental companies need a valid ID before handing over machinery. Your document is encrypted and used only for verification.
      </p>

      <Group label="Document type">
        <div role="radiogroup" aria-label="Document type" className="grid grid-cols-2 gap-2 p-3">
          {DOC_TYPES.map((d) => (
            <button
              key={d.key}
              type="button"
              role="radio"
              aria-checked={d.key === docType}
              onClick={() => changeType(d.key)}
              className={`rounded-xl border px-3 py-2.5 text-left transition ${d.key === docType ? "border-navy-950 bg-navy-950 text-white" : "border-slate-200 text-navy-950"}`}
            >
              <span className="block text-[14px] font-semibold">{d.label}</span>
              <span className={`block truncate text-[11px] ${d.key === docType ? "text-white/70" : "text-slate-500"}`}>{d.hint}</span>
            </button>
          ))}
        </div>
      </Group>

      <Group label={`${spec.label} number`}>
        <label data-field="number" className="block px-4 py-3">
          <input
            className="autofill-reset w-full bg-transparent text-[16px] tracking-wider text-navy-950 outline-none placeholder:tracking-normal placeholder:text-slate-400"
            inputMode={docType === "aadhaar" ? "numeric" : "text"}
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            placeholder={spec.placeholder}
            maxLength={spec.maxLength}
            value={docType === "aadhaar" ? number.replace(/(\d{4})(?=\d)/g, "$1 ") : number}
            onChange={(e) => {
              setNumber(spec.normalize(e.target.value));
              setErrors((er) => ({ ...er, number: undefined }));
            }}
          />
          {errors.number && <span className="mt-1 block text-[12px] text-red-500">{errors.number}</span>}
        </label>
      </Group>

      <Group label="Photos" footer="Place the document on a flat surface. All four corners should be visible and the text readable.">
        <div className={`grid gap-3 p-3 ${spec.needsBack ? "grid-cols-2" : "grid-cols-1"}`}>
          <UploadSlot
            label="Front side"
            name="front"
            upload={uploads.front}
            error={errors.front}
            onPick={(f) => pick("front", f)}
            onRemove={() => setUploads((u) => ({ ...u, front: undefined }))}
          />
          {spec.needsBack && (
            <UploadSlot
              label="Back side"
              name="back"
              upload={uploads.back}
              error={errors.back}
              onPick={(f) => pick("back", f)}
              onRemove={() => setUploads((u) => ({ ...u, back: undefined }))}
            />
          )}
        </div>
      </Group>

      <div data-field="consent">
        <label className="flex items-start gap-3 px-1 text-[13px] leading-snug text-navy-950">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => {
              setConsent(e.target.checked);
              setErrors((er) => ({ ...er, consent: undefined }));
            }}
            className="mt-0.5 h-5 w-5 shrink-0 accent-navy-950"
          />
          This document belongs to me (or my business) and I allow Machinze to verify it.
        </label>
        {errors.consent && <p className="mt-1 px-1 text-[12px] text-red-500">{errors.consent}</p>}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="flex h-[52px] w-full items-center justify-center rounded-2xl bg-navy-950 text-[16px] font-semibold text-white transition active:scale-[0.98] disabled:opacity-60"
      >
        {submitting ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : "Submit for verification"}
      </button>
      {kyc && (
        <button type="button" onClick={() => setEditing(false)} className="w-full text-center text-[14px] font-semibold text-slate-500">
          Cancel
        </button>
      )}
    </form>
  );
}
