import type { ComponentType, SVGProps } from "react";

import {
  BuilderIcon,
  ContractorIcon,
  GovernmentIcon,
  IndividualIcon,
  IndustryIcon,
} from "./CustomerTypeIcons";

export const CUSTOMER_TYPES = [
  { value: "individual", label: "Individual", Icon: IndividualIcon },
  { value: "contractor", label: "Contractor", Icon: ContractorIcon },
  { value: "builder", label: "Builder", Icon: BuilderIcon },
  { value: "industry", label: "Industry", Icon: IndustryIcon },
  { value: "government", label: "Government", Icon: GovernmentIcon },
] as const satisfies readonly { value: string; label: string; Icon: ComponentType<SVGProps<SVGSVGElement>> }[];

export type CustomerType = (typeof CUSTOMER_TYPES)[number]["value"];

type Props = {
  value: CustomerType;
  onChange: (value: CustomerType) => void;
};

export default function CustomerTypePicker({ value, onChange }: Props) {
  return (
    <fieldset data-field="customerType">
      <legend className="mb-2 text-[14px] font-semibold text-navy-950">Customer Type</legend>
      <div className="grid grid-cols-5 gap-2">
        {CUSTOMER_TYPES.map(({ value: v, label, Icon }) => {
          const active = v === value;
          return (
            <label
              key={v}
              className={`relative flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border px-0.5 pb-2.5 pt-5 transition active:scale-95 ${
                active
                  ? "border-amber-brand bg-amber-50 text-[#c77d06] shadow-[0_6px_16px_-8px_rgba(245,169,27,0.7)]"
                  : "border-slate-200 bg-white text-navy-950 hover:border-slate-300"
              }`}
            >
              <input
                type="radio"
                name="customerType"
                value={v}
                checked={active}
                onChange={() => onChange(v)}
                className="sr-only"
              />
              <span
                className={`absolute left-1.5 top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border-[1.5px] ${
                  active ? "border-amber-brand" : "border-slate-300"
                }`}
              >
                {active && <span className="h-1.5 w-1.5 rounded-full bg-amber-brand" />}
              </span>
              <Icon className={`h-7 w-7 ${active ? "fx-pop" : ""}`} />
              <span className="text-[10px] font-semibold leading-tight tracking-tight">{label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
