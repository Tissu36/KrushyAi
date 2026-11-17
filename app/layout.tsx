import type { Metadata, Viewport } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "KRUSHY AI — Your AI Workspace", description: "Chat with leading AI models, code, and use voice in one workspace.", applicationName: "KRUSHY AI" };
export const viewport: Viewport = { themeColor: "#090909", width: "device-width", initialScale: 1 };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
