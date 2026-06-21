import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "حِمو | نظام إدارة الحياة الشخصية",
  description: "Personal ERP & Life OS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
