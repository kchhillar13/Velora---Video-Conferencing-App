import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Velora — Video Conferencing",
  description: "A modern, scalable video conferencing platform built with WebRTC. Create meetings, share screens, and collaborate in real-time.",
  keywords: ["video conferencing", "webrtc", "meetings", "screen sharing", "velora"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: '#2563eb', // Matches blue-600
        },
        layout: {
          socialButtonsVariant: 'iconButton',
          socialButtonsPlacement: 'bottom',
        },
      }}
    >
      <html lang="en">
        <body className={`${inter.variable} antialiased bg-zinc-950 text-white`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
