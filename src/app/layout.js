import "./globals.css";

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
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
