import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
  return (
    <div className="min-h-screen parchment-bg flex flex-col items-center justify-center text-center px-6">
      <div className="animate-float mb-6">
        <Image src="/logo.png" alt="TODEI-LIST" width={80} height={80} className="rounded-2xl mx-auto shadow-bark" />
      </div>
      <h1
        className="text-6xl font-extrabold text-bark-600 mb-3"
        style={{ fontFamily: "'Baloo 2', cursive" }}
      >
        404
      </h1>
      <p className="text-bark-400 font-semibold text-lg mb-1">Oops! Page not found 🍃</p>
      <p className="text-bark-400 text-sm mb-7 max-w-sm">
        Looks like this page wandered off into the forest. Let's get you back on track!
      </p>
      <div className="flex gap-3">
        <Link href="/" className="btn-secondary">Go Home</Link>
        <Link href="/dashboard" className="btn-primary">Dashboard</Link>
      </div>
    </div>
  );
}
