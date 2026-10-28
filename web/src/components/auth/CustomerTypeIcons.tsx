import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base: IconProps = { width: 28, height: 28, viewBox: "0 0 28 28", fill: "currentColor", "aria-hidden": true };

export function IndividualIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="14" cy="8.5" r="5" />
      <path d="M4.5 24c0-5.2 4.3-9 9.5-9s9.5 3.8 9.5 9v.5h-19z" />
    </svg>
  );
}

export function ContractorIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6 16a8 8 0 0 1 16 0z" />
      <rect x="12" y="5.5" width="4" height="6" rx="1" />
      <rect x="3.5" y="16" width="21" height="3" rx="1.5" />
      <path d="M9 21h10a5 5 0 0 1-10 0z" opacity="0.55" />
    </svg>
  );
}

export function BuilderIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 25V6.5L13 3v22z" />
      <path d="M15 25V11h9v14z" opacity="0.8" />
      <g fill="#fff">
        <rect x="6.5" y="9" width="2" height="2" />
        <rect x="9.8" y="9" width="2" height="2" />
        <rect x="6.5" y="13.5" width="2" height="2" />
        <rect x="9.8" y="13.5" width="2" height="2" />
        <rect x="6.5" y="18" width="2" height="2" />
        <rect x="9.8" y="18" width="2" height="2" />
        <rect x="17.5" y="14" width="1.8" height="1.8" />
        <rect x="20.5" y="14" width="1.8" height="1.8" />
        <rect x="17.5" y="18" width="1.8" height="1.8" />
        <rect x="20.5" y="18" width="1.8" height="1.8" />
      </g>
      <rect x="2.5" y="24" width="23" height="1.6" rx="0.8" />
    </svg>
  );
}

export function IndustryIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 25V13l6 3.5V13l6 3.5V13l6 3.5V4h4v21z" />
      <g fill="#fff">
        <rect x="6" y="19.5" width="2.5" height="2.5" />
        <rect x="11" y="19.5" width="2.5" height="2.5" />
        <rect x="16" y="19.5" width="2.5" height="2.5" />
      </g>
      <circle cx="20" cy="2.8" r="1.6" opacity="0.4" />
    </svg>
  );
}

export function GovernmentIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M14 2.5 25 8.5H3z" />
      <rect x="3.5" y="9.5" width="21" height="2" rx="0.6" />
      <rect x="5.5" y="12.5" width="2.6" height="9" />
      <rect x="10.4" y="12.5" width="2.6" height="9" />
      <rect x="15" y="12.5" width="2.6" height="9" />
      <rect x="19.9" y="12.5" width="2.6" height="9" />
      <rect x="2.5" y="22.5" width="23" height="3" rx="0.8" />
    </svg>
  );
}
