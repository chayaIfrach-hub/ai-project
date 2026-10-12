import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "הספרייה שלי",
  description: "אפליקציית ניהול ספרייה אישית עם סוכן AI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl">
      <body className="min-h-screen flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}