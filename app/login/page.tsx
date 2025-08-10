"use client";

import { SignIn, SignUp, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  const [mounted, setMounted] = useState(false);
  const [type, setType] = useState<"signin" | "signup">("signin");

  useEffect(() => {
    setMounted(true);
    const updateTypeFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const t = params.get("t");
      if (t === "signup") setType("signup");
      else setType("signin");
    };

    updateTypeFromUrl();

    window.addEventListener("popstate", updateTypeFromUrl);

    return () => window.removeEventListener("popstate", updateTypeFromUrl);
  }, []);

  useEffect(() => {
    if (isLoaded && user) {
      router.replace("/browse");
    }
  }, [isLoaded, user, router]);

  if (!mounted) return null;

  const lines = [
    ["Welcome", "to", "Bankai."],
    ["Your", "personalized", "streaming", "experience", "starts", "here."],
    ["Sign", "in", "or", "create", "an", "account", "to", "begin", "browsing."],
  ];

  const changeType = (newType: "signin" | "signup") => {
    router.push(`/login?t=${newType}`);
    setType(newType);
  };

  return (
    <>
      <style>{`
        @keyframes fadeSlideIn {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div className="flex flex-col md:flex-row min-h-screen transition-colors duration-300">
        {/* Left side */}
        <div className="flex-1 flex flex-col justify-center px-6 md:px-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 leading-snug">
            {lines.map((line, lineIdx) => {
              const startIndex = lines.slice(0, lineIdx).flat().length;
              return (
                <div key={lineIdx} className="mb-2 break-words">
                  {line.map((word, idx) => {
                    const wordIndex = startIndex + idx;
                    return (
                      <span
                        key={idx}
                        className={word === "Bankai." ? "text-purple-500" : ""}
                        style={{
                          marginRight:
                            idx !== line.length - 1 ? "0.25em" : undefined,
                          display: "inline",
                          whiteSpace: "normal",
                          opacity: 0,
                          animation: `fadeSlideIn 0.3s ease forwards`,
                          animationDelay: `${wordIndex * 80}ms`,
                        }}
                      >
                        {word}
                      </span>
                    );
                  })}
                </div>
              );
            })}
          </h1>

          <p className="text-lg max-w-md opacity-80">
            Unlimited access to our catalog. Create and manage watchlists. Get
            recommendations tailored for you.
          </p>

          <div className="mt-6 flex gap-4">
            <Button
              onClick={() => changeType("signin")}
              className="bg-purple-500 text-white hover:bg-purple-600"
            >
              Sign in
            </Button>
            <Button
              variant="outline"
              onClick={() => changeType("signup")}
              className="text-purple-500 border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20"
            >
              Sign up
            </Button>
          </div>
        </div>

        {/* Right side */}
        <div className="flex-1 flex justify-center items-center p-6">
          {type === "signup" ? <SignUp /> : <SignIn />}
        </div>
      </div>
    </>
  );
}
