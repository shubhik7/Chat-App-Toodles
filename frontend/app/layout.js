import AuthProvider from "./components/AuthContext";
import QueryProvider from "./components/QueryProvider";
import Toaster from "./components/Toaster";
import "./globals.css";

export const metadata = {
  title: "Toodles",
  description: "Chat with friends and groups in real time.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
