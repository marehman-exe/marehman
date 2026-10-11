import type { Metadata } from "next";
import { Space_Grotesk, Instrument_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { RoleProvider } from "@/context/RoleContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ThemeScript } from "@/components/ThemeScript";
import { profile } from "@/data/profile";

const fontDisplay = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const fontBody = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const fontMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

const baseUrl = "https://marehman.me";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: `${profile.name} — ${profile.title}`,
    template: `%s — ${profile.name}`,
  },
  description: `${profile.title}. ${profile.tagline}`,
  authors: [{ name: profile.name, url: baseUrl }],
  creator: profile.name,
  keywords: [
    profile.name,
    "AI engineer",
    "Python developer",
    "RAG",
    "LLM applications",
    "machine learning",
    "FastAPI",
    "PostgreSQL",
    "pgvector",
    "Faisalabad",
  ],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: profile.name,
    title: `${profile.name} — ${profile.title}`,
    description: `${profile.title}. ${profile.tagline}`,
    images: [
      {
        url: `${baseUrl}/og.png`,
        width: 1200,
        height: 630,
        alt: profile.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${profile.name} — ${profile.title}`,
    description: `${profile.title}. ${profile.tagline}`,
    images: [`${baseUrl}/og.png`],
  },
  alternates: { canonical: baseUrl },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${fontDisplay.variable} ${fontBody.variable} ${fontMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body>
        <RoleProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <div className="flex-1">{children}</div>
            <Footer />
          </div>
        </RoleProvider>
      </body>
    </html>
  );
}
