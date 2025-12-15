import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flowork - Workflow Builder",
  description: "Build and execute AI-powered workflows",
};

export function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-zinc-950 text-zinc-50">
        {children}
      </body>
    </html>
  );
}

export default RootLayout;
