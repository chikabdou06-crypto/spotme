import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { SpotMeProvider } from "@/context/SpotMeContext";

export const metadata: Metadata = {
  title: "SpotMe | The Social Bro Radar for Gym-Goers",
  description:
    "Frictionless, visual social workout radar. Drop a gym ping, spot your crew, or counter-propose times and gyms in real time.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SpotMe",
  },
};

export const viewport: Viewport = {
  themeColor: "#07090E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-obsidian-950 text-white antialiased h-dvh w-screen overflow-hidden">
        <AuthProvider>
          <SpotMeProvider>{children}</SpotMeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
