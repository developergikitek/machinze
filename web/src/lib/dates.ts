// Din "aaj se offset" (0 = aaj) ke roop me rakhte hain — timezone / DST ki jhanjhat nahi

export function addDays(base: Date, n: number) {
  const d = new Date(base);
  d.setDate(base.getDate() + n);
  return d;
}

export function dayOffset(today: Date, d: Date) {
  return Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() - today.getTime()) / 86_400_000);
}

export function formatDay(d: Date) {
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

// Local tareekh "yyyy-mm-dd" (toISOString UTC me khisak jaata hai)
export function toISODate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function fromISODate(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}
