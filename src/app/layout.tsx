import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import ImageGuard from "@/components/ImageGuard";
import "./globals.css";

export const metadata: Metadata = {
  title: "VITALIS · Lifestyle, hábitos y motivación",
  description:
    "Plataforma interactiva de lifestyle y fitness: habit tracker con rachas, rutinas y recetas fitness creadas por ti, frases motivacionales propias y un panel visual 3D.",
  applicationName: "VITALIS",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "VITALIS",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#05030a",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Runs before first paint: decides once per session whether the intro plays,
            so the page never flashes before the overlay appears. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              '(function(){try{var p=location.pathname;if((p==="/"||p==="/dashboard")&&!sessionStorage.getItem("vitalis_intro_v4")){sessionStorage.setItem("vitalis_intro_v4","1");document.documentElement.classList.add("vt-intro-on")}}catch(e){}})();',
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Outfit:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-ink text-slate-100 antialiased selection:bg-fuchsia-500/40">
        <ImageGuard />
        {children}
      </body>
    </html>
  );
}
