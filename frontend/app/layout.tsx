// frontend/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/lib/context";
import { getAuthenticatedUser } from "@/lib/auth.server";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Post App",
  description: "Full stack app with Hono.js and Next.js",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getAuthenticatedUser();

  return (
    <html lang="en" data-theme="modernclean">
      <body className={inter.className}>
        <AuthProvider user={user}>
          <Toaster position="bottom-right" />
          <div className="flex flex-col min-h-screen bg-base-200">
            <Navbar />
            <main className="flex-grow p-4 md:p-8">
              {children}
            </main>
            <footer className="footer footer-center p-4 bg-base-100 text-base-content border-t border-base-300">
              <aside>
                <p>Built with Hono, Next.js, and DaisyUI</p>
              </aside>
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
