import { Link, Outlet, useLocation } from "react-router-dom";
import "./rootLayout.css";
import { ClerkProvider, SignedIn, UserButton } from "@clerk/clerk-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ChatList from "../../components/chatList/ChatList";
import { AlignJustify, X } from "lucide-react";
import { useState } from "react";
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

const queryClient = new QueryClient();

const RootLayout = () => {
  const [open, setOpen] = useState(false);
  const path = useLocation().pathname;

  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <QueryClientProvider client={queryClient}>
        <div className="rootLayout">
          <header>
            {path !== "/" && path !== "/sign-in" && path !== "/sign-up" && (
              <>
                {open ? (
                  <X className="md:hidden" onClick={() => setOpen(!open)} />
                ) : (
                  <AlignJustify
                    className="md:hidden"
                    onClick={() => setOpen(!open)}
                  />
                )}
              </>
            )}
            <Link to="/" className="logo">
              <img src="/logo.png" alt="" />
              <span>GPT Plus</span>
            </Link>
            <div className="user">
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          </header>

          {path !== "/" && path !== "/sign-in" && path !== "/sign-up" && (
            <div
              className={`menu -left-96 md:left-0 transition-all duration-200 fixed top-12 bottom-0 z-40 bg-[#0e0c16] ${
                open && "left-0"
              }`}
            >
              <ChatList />
            </div>
          )}
          <main>
            <Outlet />
          </main>
        </div>
      </QueryClientProvider>
    </ClerkProvider>
  );
};

export default RootLayout;
