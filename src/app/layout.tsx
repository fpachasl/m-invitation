import type { Metadata, Viewport } from "next";
import { Arizonia, Lora, Newsreader } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  axes: ["opsz"],
});

const arizonia = Arizonia({
  variable: "--font-arizonia",
  subsets: ["latin"],
  weight: ["400"],
});

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "¡Estás invitado(a)! · 60 años",
  description:
    "Estás invitado(a) a celebrar conmigo mis 60 años. Sábado 24 de octubre, 6:00 PM. Confirma tu asistencia.",
};

export const viewport: Viewport = {
  themeColor: "#d9d9d9",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${lora.variable} ${newsreader.variable} ${arizonia.variable} antialiased`}
    >
      <body className="min-h-svh">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              fontFamily: "var(--font-lora)",
              background: "#1c1c1c",
              color: "#f2f2f2",
              border: "1px solid #3a3a3a",
            },
          }}
        />
      </body>
    </html>
  );
}
