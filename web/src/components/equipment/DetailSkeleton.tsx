// Detail page ka placeholder — params resolve hone tak (navigation turant dikhe)
export default function DetailSkeleton() {
  const block = "animate-pulse rounded-xl bg-slate-100 motion-reduce:animate-none";
  return (
    <div aria-busy aria-label="Loading equipment">
      <div className="flex h-14 items-center justify-between px-4">
        <span className={`${block} h-8 w-8 rounded-full`} />
        <span className={`${block} h-6 w-28`} />
        <span className={`${block} h-8 w-16 rounded-full`} />
      </div>
      <div className={`${block} aspect-[16/11] rounded-none`} />
      <div className="space-y-3 px-4 pt-5">
        <span className={`${block} block h-7 w-3/4`} />
        <span className={`${block} block h-4 w-1/3`} />
        <span className={`${block} block h-4 w-1/2`} />
        <div className="grid grid-cols-3 gap-2 pt-6">
          {[0, 1, 2].map((i) => (
            <span key={i} className={`${block} h-20 rounded-2xl`} />
          ))}
        </div>
      </div>
    </div>
  );
}
