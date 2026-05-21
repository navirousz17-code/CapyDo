import Image from 'next/image';

export default function Loading() {
  return (
    <div className="min-h-screen parchment-bg flex flex-col items-center justify-center gap-6">
      <div className="relative animate-float">
        <div className="absolute inset-0 bg-moss-200 rounded-full blur-2xl opacity-40 scale-150" />
        <Image
          src="/logo.png"
          alt="TODEI-LIST"
          width={80}
          height={80}
          className="relative z-10 rounded-2xl shadow-bark"
        />
      </div>
      <div className="flex flex-col items-center gap-2">
        <div
          className="text-2xl font-extrabold text-bark-600"
          style={{ fontFamily: "'Baloo 2', cursive" }}
        >
          TODEI-LIST
        </div>
        <div className="flex gap-1.5 mt-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-bark-400 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
