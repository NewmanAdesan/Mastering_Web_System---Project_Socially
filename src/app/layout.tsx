import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { Toaster } from "@/components/ui/toaster";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Socially",
  description: "A modern social media application built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
    {/* Context #1: Provides authentication state and user management */}
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {/* Context #2: Manages dark/light mode theme */}
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange> 

              {/* Container #1: Ensures the layout takes at least the full viewport height */}
              <div className="min-h-screen"> 
                <Navbar />

                {/* Container #2: Adds vertical padding to the main content area */}
                <main className="py-8"> 

                  {/* Container #3: Centers content with a max width and horizontal padding */}
                  <div className="max-w-7xl mx-auto px-4"> 

                    {/* Container #4: Creates a responsive grid layout with spacing */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                      {/* Item #1: Sidebar, hidden on small screens, spans 3 columns on large screens */}
                      <div className="hidden lg:block lg:col-span-3"> 
                        <Sidebar />
                      </div>

                      {/* Item #2: Main content area, spans 9 columns on large screens */}
                      <div className="lg:col-span-9"> 
                        {children}
                      </div>
                    </div>
                  </div>
                </main>
              </div>

              <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}