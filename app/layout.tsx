import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Project Mentor",
  description:
    "Track student progress for project-based learning with an AI mentor that leverages project memory.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased" suppressHydrationWarning>{children}</body>
    </html>
  );
}
