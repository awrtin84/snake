import { Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-sans",
});

const spaceMono = Space_Mono({
    subsets: ["latin"],
    weight: ["400", "700"],
    variable: "--font-mono",
});

export const metadata = {
    title: "Nokia Snake",
    description: "Nostalgic Nokia-style snake game built with Next.js",
    manifest: "/manifest.json",
};

export const viewport = {
    themeColor: "#0d2818",
};

export default function RootLayout({ children }) {
    return (
        <html
            lang="en"
            className={`${spaceGrotesk.variable} ${spaceMono.variable}`}
        >
            <body>{children}</body>
        </html>
    );
}
