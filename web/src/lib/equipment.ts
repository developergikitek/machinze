// TODO: backend API se lao (user ki location ke hisaab se). Abhi demo data.

export type EquipmentArt = "excavator" | "crane" | "generator";

// Feature / spec ke icon names (UI me abhi text list hai; icons chahiye to inse map karo)
export type DetailIcon =
  | "operator"
  | "shield"
  | "fuel"
  | "gps"
  | "noise"
  | "boom"
  | "bucket"
  | "depth"
  | "engine"
  | "weight"
  | "tank"
  | "calendar"
  | "reach"
  | "power";

export type Review = { name: string; rating: number; date: string; text: string };

export type Vendor = {
  name: string;
  verified: boolean;
  rating: number;
  responseMins: number;
  since: number;
  phone: string;
};

export type Equipment = {
  id: string;
  name: string;
  // CATEGORY_ART key — search filter + icons
  category: string;
  rating: number;
  reviews: number;
  distanceKm: number;
  area: string;
  tags: string[];
  pricePerHour: number;
  pricePerDay: number;
  pricePerWeek: number;
  // 0 = operator rent me included
  operatorPerDay: number;
  deliveryFee: number;
  deposit: number;
  available: boolean;
  // Vendor ke paas kitni machines — ek booking me max itni. TODO: dates ke hisaab se availability API se
  units: number;
  // Asli photo ka URL; na ho to illustration
  image?: string;
  // Detail page gallery (na ho to sirf `image`)
  images?: string[];
  art: EquipmentArt;
  features: { icon: DetailIcon; label: string }[];
  specs: { icon: DetailIcon; label: string; value: string }[];
  about: string;
  vendor: Vendor;
  // Aaj se agle 7 din — true = free
  availability: boolean[];
  reviewsList: Review[];
};

export const NEARBY_EQUIPMENT: Equipment[] = [
  {
    id: "jcb-3dx",
    name: "JCB 3DX Excavator",
    category: "excavators",
    rating: 4.8,
    reviews: 124,
    distanceKm: 2.4,
    area: "Sector 18, Noida",
    tags: ["Operator Available", "GPS Enabled"],
    pricePerHour: 1500,
    pricePerDay: 10000,
    pricePerWeek: 60000,
    operatorPerDay: 1200,
    deliveryFee: 1500,
    deposit: 15000,
    available: true,
    units: 3,
    image: "/equipment/jcb-3dx.jpg",
    art: "excavator",
    features: [
      { icon: "operator", label: "Operator available" },
      { icon: "shield", label: "Well maintained" },
      { icon: "fuel", label: "Fuel efficient" },
      { icon: "gps", label: "GPS enabled" },
    ],
    specs: [
      { icon: "bucket", label: "Bucket capacity", value: "0.26 m³" },
      { icon: "depth", label: "Max digging depth", value: "4.77 m" },
      { icon: "engine", label: "Engine power", value: "74 HP" },
      { icon: "weight", label: "Operating weight", value: "7,450 kg" },
      { icon: "tank", label: "Fuel tank", value: "128 L" },
      { icon: "calendar", label: "Year", value: "2022" },
    ],
    about:
      "JCB 3DX is a highly reliable and versatile backhoe loader, ideal for a wide range of construction and excavation tasks — trenching, loading, levelling and site clearing. Serviced every 250 hours and performance-tested before every rental, so you get a machine that just works. Comes with a full tank and a basic tool kit.",
    vendor: { name: "Shree Ram Equipments", verified: true, rating: 4.9, responseMins: 10, since: 2016, phone: "+919876511111" },
    availability: [true, true, false, true, true, true, false],
    reviewsList: [
      { name: "Vikas S.", rating: 5, date: "Oct 2026", text: "Machine arrived on time and the operator was very experienced. We finished the foundation work a day early." },
      { name: "Neha Builders", rating: 4, date: "Sep 2026", text: "Good condition, fair pricing. Delivery was a little late, but the vendor let us know in advance." },
    ],
  },
  {
    id: "crane-25t",
    name: "Mobile Crane 25T",
    category: "cranes",
    rating: 4.6,
    reviews: 89,
    distanceKm: 3.1,
    area: "Sector 16, Noida",
    tags: ["Certified Operator", "Hydraulic Boom"],
    pricePerHour: 2200,
    pricePerDay: 15000,
    pricePerWeek: 90000,
    operatorPerDay: 0,
    deliveryFee: 2500,
    deposit: 25000,
    available: true,
    units: 2,
    image: "/equipment/crane-25t.jpg",
    art: "crane",
    features: [
      { icon: "operator", label: "Certified operator" },
      { icon: "boom", label: "Hydraulic boom" },
      { icon: "shield", label: "Load tested" },
      { icon: "gps", label: "GPS enabled" },
    ],
    specs: [
      { icon: "weight", label: "Lifting capacity", value: "25 T" },
      { icon: "reach", label: "Boom length", value: "31 m" },
      { icon: "engine", label: "Engine power", value: "260 HP" },
      { icon: "depth", label: "Max lift height", value: "40 m" },
      { icon: "tank", label: "Fuel tank", value: "300 L" },
      { icon: "calendar", label: "Year", value: "2021" },
    ],
    about:
      "25-tonne truck-mounted mobile crane with a 31 m hydraulic boom — fast to set up and road-legal, ideal for steel erection, precast placement and equipment shifting. Operator is certified and included in the rent. Load chart and fitness certificate shared on booking.",
    vendor: { name: "Noida Crane Services", verified: true, rating: 4.7, responseMins: 15, since: 2012, phone: "+919876522222" },
    availability: [false, true, true, true, false, true, true],
    reviewsList: [
      { name: "Rajat Infra", rating: 5, date: "Oct 2026", text: "The operator placed our precast slabs very safely. Highly recommended." },
      { name: "Amit K.", rating: 4, date: "Aug 2026", text: "Crane was in good condition and setup was quick." },
    ],
  },
  {
    id: "gen-125kva",
    name: "Silent Generator 125 kVA",
    category: "generators",
    rating: 4.7,
    reviews: 67,
    distanceKm: 1.8,
    area: "Sector 62, Noida",
    tags: ["Low Noise", "Fuel Efficient"],
    pricePerHour: 800,
    pricePerDay: 6000,
    pricePerWeek: 36000,
    operatorPerDay: 600,
    deliveryFee: 1000,
    deposit: 10000,
    available: true,
    units: 4,
    image: "/equipment/gen-125kva.jpg",
    art: "generator",
    features: [
      { icon: "noise", label: "Low noise" },
      { icon: "fuel", label: "Fuel efficient" },
      { icon: "shield", label: "Well maintained" },
      { icon: "operator", label: "Technician on call" },
    ],
    specs: [
      { icon: "power", label: "Prime power", value: "125 kVA" },
      { icon: "tank", label: "Fuel tank", value: "250 L" },
      { icon: "fuel", label: "Consumption", value: "18 L/hr" },
      { icon: "noise", label: "Noise level", value: "75 dB" },
      { icon: "weight", label: "Weight", value: "2,100 kg" },
      { icon: "calendar", label: "Year", value: "2023" },
    ],
    about:
      "Acoustic-canopy diesel generator, perfect for construction sites, events and backup power. Auto start with AMF panel, low fuel consumption and a quiet 75 dB output. Delivered with cables and earthing kit; technician available on call.",
    vendor: { name: "PowerLine Rentals", verified: false, rating: 4.5, responseMins: 30, since: 2019, phone: "+919876533333" },
    availability: [true, true, true, true, true, false, true],
    reviewsList: [
      { name: "Event Hub", rating: 5, date: "Oct 2026", text: "Really quiet — no issues at all through the whole event." },
      { name: "Sunil P.", rating: 4, date: "Jul 2026", text: "Good generator, and fuel consumption was low too." },
    ],
  },
];

export function getEquipment(id: string) {
  return NEARBY_EQUIPMENT.find((e) => e.id === id) ?? null;
}

// TODO: backend search API
export function searchEquipment({ q, category }: { q?: string; category?: string }) {
  const needle = q?.trim().toLowerCase();
  return NEARBY_EQUIPMENT.filter(
    (e) =>
      (!category || e.category === category) &&
      (!needle || [e.name, e.category, e.area, ...e.tags].some((s) => s.toLowerCase().includes(needle))),
  );
}

// TODO: user ki search history API
export const RECENT_SEARCHES = [
  { query: "JCB 3DX Excavator", place: "Sector 18, Noida", equipmentId: "jcb-3dx" },
  { query: "Mobile Crane 25T", place: "Sector 16, Noida", equipmentId: "crane-25t" },
];

// TODO: notifications API
export const UNREAD_NOTIFICATIONS = 3;

export function formatINR(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}
