// ID proof (KYC) — pehli delivery se pehle zaroori. Demo me status device pe; photos sirf preview.
// TODO: KYC API — photos upload, server pe verification, status webhook

export type DocType = "aadhaar" | "pan" | "dl" | "gst";
export type KycStatus = "none" | "pending" | "verified" | "rejected";

export type DocSpec = {
  key: DocType;
  label: string;
  hint: string;
  placeholder: string;
  // input se pehle saaf karo (spaces / lowercase)
  normalize: (v: string) => string;
  valid: (v: string) => boolean;
  maxLength: number;
  needsBack: boolean;
};

export const DOC_TYPES: DocSpec[] = [
  {
    key: "aadhaar",
    label: "Aadhaar",
    hint: "12-digit number",
    placeholder: "1234 5678 9012",
    normalize: (v) => v.replace(/\D/g, "").slice(0, 12),
    valid: (v) => /^[2-9]\d{11}$/.test(v),
    maxLength: 12,
    needsBack: true,
  },
  {
    key: "pan",
    label: "PAN",
    hint: "e.g. ABCDE1234F",
    placeholder: "ABCDE1234F",
    normalize: (v) => v.replace(/[^a-z0-9]/gi, "").toUpperCase().slice(0, 10),
    valid: (v) => /^[A-Z]{5}\d{4}[A-Z]$/.test(v),
    maxLength: 10,
    needsBack: false,
  },
  {
    key: "dl",
    label: "Driving licence",
    hint: "e.g. UP1620190012345",
    placeholder: "UP1620190012345",
    normalize: (v) => v.replace(/[^a-z0-9]/gi, "").toUpperCase().slice(0, 16),
    valid: (v) => /^[A-Z]{2}\d{2}\d{4}\d{7}$/.test(v) || /^[A-Z]{2}\d{13}$/.test(v),
    maxLength: 16,
    needsBack: true,
  },
  {
    key: "gst",
    label: "GST certificate",
    hint: "For businesses · 15-character GSTIN",
    placeholder: "09ABCDE1234F1Z5",
    normalize: (v) => v.replace(/[^a-z0-9]/gi, "").toUpperCase().slice(0, 15),
    valid: (v) => /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(v),
    maxLength: 15,
    needsBack: false,
  },
];

export type KycRecord = {
  status: Exclude<KycStatus, "none">;
  docType: DocType;
  // sirf aakhri 4 — poora number device pe nahi rakhte
  last4: string;
  submittedAt: string;
};

export const KYC_KEY = "equiprent:kyc";
export const MAX_DOC_BYTES = 5 * 1024 * 1024;
export const DOC_FILE_TYPES = ["image/jpeg", "image/png", "application/pdf"];

export function docSpec(type: DocType) {
  return DOC_TYPES.find((d) => d.key === type)!;
}

export function maskedNumber(r: KycRecord) {
  return `•••• ${r.last4}`;
}
