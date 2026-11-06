import type { Metadata } from "next";
import "../src/index.css";

export const metadata: Metadata = {
  title: "PRISM | Examination Cockpit & Progress Tracker",
  description: "Open-source past-paper solver, examination cockpit, and progress tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#08090A] text-[#F1F5F9] antialiased select-none overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
