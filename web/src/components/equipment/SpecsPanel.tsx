import { Equipment } from "@/lib/equipment";

import { Group, Row } from "./Group";

export default function SpecsPanel({ item }: { item: Equipment }) {
  return (
    <div className="space-y-6">
      <Group label="Technical">
        {item.specs.map((s) => (
          <Row key={s.label} label={s.label} value={s.value} />
        ))}
      </Group>
      <Group label="Listing">
        <Row label="Category" value={<span className="capitalize">{item.category.replace(/s$/, "")}</span>} />
        <Row label="Location" value={item.area} />
        <Row label="Distance" value={`${item.distanceKm} km`} />
      </Group>
    </div>
  );
}
