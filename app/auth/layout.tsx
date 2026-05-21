import Image from 'next/image';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen parchment-bg flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-moss-100 to-cream-200 p-12">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cream-300 rounded-full opacity-30 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-moss-200 rounded-full opacity-30 blur-3xl" />

        <div className="relative z-10 text-center">
          <Image
            src="/splashlogo.png"
            alt="TODEI-LIST"
            width={320}
            height={250}
            className="drop-shadow-2xl mb-8 animate-float"
          />
          <h2
            className="text-3xl font-extrabold text-bark-600 mb-3"
            style={{ fontFamily: "'Baloo 2', cursive" }}
          >
            Welcome back!
          </h2>
          <p className="text-bark-400 font-medium max-w-xs">
            Your tasks are waiting. Let's make today productive! 🌿
          </p>

          <div className="flex flex-col gap-3 mt-8 text-left">
            {[
              '✅ Create and manage unlimited tasks',
              '📂 Organize with custom categories',
              '📅 Never miss a deadline again',
              '⚡ Real-time sync across devices',
            ].map((feat) => (
              <div
                key={feat}
                className="flex items-center gap-2 text-bark-500 text-sm font-semibold"
              >
                {feat}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right auth panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center justify-center gap-2 mb-8 lg:hidden">
            <Image src="/logo.png" alt="TODEI-LIST" width={40} height={40} className="rounded-xl" />
            <Link
              href="/"
              className="text-xl font-bold text-bark-600"
              style={{ fontFamily: "'Baloo 2', cursive" }}
            >
              TODEI-LIST
            </Link>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
