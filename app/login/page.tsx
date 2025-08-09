"use client";

import { SignIn, SignUp, useUser } from "@clerk/nextjs";
import { useSearchParams, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const type = searchParams.get("t") || "signin";
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { resolvedTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (isLoaded && user) {
      router.replace("/browse");
    }
  }, [isLoaded, user, router]);

  const lines = [
    ["Welcome", "to", "Bankai."],
    ["Your", "personalized", "streaming", "experience", "starts", "here."],
    ["Sign", "in", "or", "create", "an", "account", "to", "begin", "browsing."]
  ];

  if (!mounted) {
    return null;
  }

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

      <div
        className={`flex flex-col md:flex-row min-h-screen ${
          resolvedTheme === "dark" ? "bg-black text-white" : "bg-white text-black"
        } transition-colors duration-300`}
      >
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
                          marginRight: idx !== line.length - 1 ? "0.25em" : undefined,
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
            Unlimited access to our catalog. Create and manage watchlists.  
            Get recommendations tailored for you.
          </p>

          <div className="mt-6 flex gap-4">
            <Button
              onClick={() => router.push("/login?t=signin")}
              className="bg-purple-500 text-white hover:bg-purple-600"
            >
              Sign in
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/login?t=signup")}
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
