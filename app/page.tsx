"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ModeToggle } from "@/components/themeToggler";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import animeData from "@/lib/animeData";
import { Anime } from "@tutkli/jikan-ts";

const TOP_LIMIT = 20;

function LoadingImage({
  alt,
  className,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement> & { alt: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative w-full h-72 rounded-t-xl overflow-hidden bg-gray-200 dark:bg-gray-800">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-300/50 dark:bg-gray-700/50">
          <svg
            className="animate-spin h-6 w-6 text-gray-500 dark:text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        </div>
      )}
      <img
        {...props}
        alt={alt}
        className={`${className} w-full h-72 object-cover transition-opacity duration-700 ease-in-out ${
          loaded ? "opacity-100" : "opacity-0 blur-sm"
        }`}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}

export default function Home() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [topAnime, setTopAnime] = useState<Anime[]>([]);
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace("/browse");
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    async function fetchTopAnime() {
      try {
        const response = await animeData.top.getTopAnime({ limit: TOP_LIMIT });
        setTopAnime(response.data);
      } catch {
        setTopAnime([]);
      }
    }
    fetchTopAnime();
  }, []);

  useEffect(() => {
    setIframeLoaded(false);
  }, [selectedAnime]);

  if (!isLoaded || isSignedIn) {
    return null;
  }

  const closeDialog = () => setSelectedAnime(null);

  return (
    <>
      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 2.5s ease-in-out infinite;
        }
      `}</style>

      <div className="min-h-screen flex flex-col bg-white dark:bg-black text-gray-900 dark:text-gray-100">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-center px-6 py-4">
          <div className="text-4xl font-extrabold tracking-tight select-none cursor-default mb-3 sm:mb-0">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300">
              Bankai
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <ModeToggle />
            <Button size="sm" onClick={() => router.push("/login")}>
              Get Started
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow flex flex-col justify-center items-center px-6 text-center space-y-6 py-10 max-w-7xl mx-auto w-full">
          <h1 className="text-5xl font-extrabold leading-tight max-w-4xl">Welcome to Bankai</h1>
          <p className="max-w-xl text-muted-foreground text-lg leading-relaxed">
            Watch your favorite anime, manage your watch lists, and create playlists with a clean and easy-to-use
            interface.
          </p>
          <Button onClick={() => router.push("/login")} className="px-10 py-3 text-lg font-semibold">
            Get Started
          </Button>

          {/* Trending Now */}
          <h2 className="text-3xl font-semibold mt-16 mb-8 w-full text-left max-w-7xl">Trending
            Now</h2>

          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 w-full">
            {topAnime.length === 0
              ? Array.from({ length: TOP_LIMIT }).map((_, i) => (
                  <div
                    key={i}
                    className="w-full h-80 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"
                  />
                ))
              : topAnime.map((anime, index) => (
                  <div
                    key={`anime-${anime.mal_id ?? index}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedAnime(anime)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") setSelectedAnime(anime);
                    }}
                    className="
                      relative 
                      cursor-pointer 
                      rounded-xl 
                      overflow-hidden
                      shadow-lg
                      focus:outline-none 
                      focus:ring-4 focus:ring-offset-2 focus:ring-primary-500 
                      transition 
                      transform 
                      duration-300 
                      ease-in-out
                      hover:scale-[1.05]
                      hover:shadow-2xl
                      hover:ring-4
                      hover:ring-primary-400
                      hover:animate-bounce-slow
                      bg-gradient-to-br from-gray-50 dark:from-gray-900 to-white dark:to-gray-800
                    "
                  >
                    <LoadingImage
                      alt={anime.title}
                      src={anime.images.jpg.image_url}
                      width={320}
                      height={320}
                      className="h-72 rounded-t-xl"
                    />
                    {/* Decorative sparkle icon top right */}
                    <div className="absolute top-3 right-3 text-yellow-400 opacity-70 animate-pulse-slow">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        className="w-6 h-6 drop-shadow-md"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l.72 2.21a1 1 0 00.95.69h2.324c.969 0 1.371 1.24.588 1.81l-1.88 1.36a1 1 0 00-.364 1.118l.72 2.21c.3.92-.755 1.688-1.538 1.118l-1.88-1.36a1 1 0 00-1.176 0l-1.88 1.36c-.783.57-1.838-.198-1.538-1.118l.72-2.21a1 1 0 00-.364-1.118L2.447 7.637c-.783-.57-.38-1.81.588-1.81h2.324a1 1 0 00.95-.69l.72-2.21z" />
                      </svg>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 rounded-b-xl">
                      <h3 className="text-lg font-semibold line-clamp-2 text-white">
                        {anime.title_english || anime.title}
                      </h3>
                      <p className="text-sm text-gray-300 truncate">
                        Score: {anime.score ?? "N/A"} | Episodes: {anime.episodes ?? "N/A"}
                      </p>
                    </div>
                  </div>
                ))}
          </div>
        </main>

        {/* Dialog for selected Anime */}
        <Dialog open={!!selectedAnime} onOpenChange={closeDialog}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto rounded-lg p-6">
            {selectedAnime && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-3xl font-bold mb-2">
                    {selectedAnime.title_english || selectedAnime.title}
                  </DialogTitle>
                </DialogHeader>

                <img
                  src={selectedAnime.images.jpg.large_image_url || selectedAnime.images.jpg.image_url}
                  alt={selectedAnime.title}
                  className="w-full max-h-96 object-cover rounded-md mb-4"
                />

                {/* Wrap block elements inside a div to fix invalid nesting */}
                <DialogDescription>
                  <div>
                    <p className="mb-4">{selectedAnime.synopsis || "No description available."}</p>
                    <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-muted-foreground mb-6">
                      <li>
                        <strong>Episodes:</strong> {selectedAnime.episodes ?? "N/A"}
                      </li>
                      <li>
                        <strong>Score:</strong> {selectedAnime.score ?? "N/A"}
                      </li>
                      <li>
                        <strong>Type:</strong> {selectedAnime.type}
                      </li>
                      <li>
                        <strong>Status:</strong> {selectedAnime.status}
                      </li>
                      <li>
                        <strong>Year:</strong> {selectedAnime.year}
                      </li>
                      <li>
                        <strong>Rating:</strong> {selectedAnime.rating}
                      </li>
                      <li className="col-span-2">
                        <strong>Genres:</strong>{" "}
                        {selectedAnime.genres.length > 0
                          ? selectedAnime.genres.map((g) => g.name).join(", ")
                          : "N/A"}
                      </li>
                      <li className="col-span-2">
                        <strong>Studios:</strong>{" "}
                        {selectedAnime.studios.length > 0
                          ? selectedAnime.studios.map((s) => s.name).join(", ")
                          : "N/A"}
                      </li>
                    </ul>

                    {selectedAnime.trailer?.youtube_id && (
                      <div className="relative w-full aspect-video rounded-md overflow-hidden bg-gray-100 dark:bg-gray-900">
                        {!iframeLoaded && (
                          <div className="absolute inset-0 flex justify-center items-center bg-gray-200 dark:bg-gray-800">
                            <svg
                              className="animate-spin h-8 w-8 text-gray-500 dark:text-gray-400"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v8z"
                              />
                            </svg>
                          </div>
                        )}
                        <iframe
                          src={`https://www.youtube.com/embed/${selectedAnime.trailer.youtube_id}`}
                          title="Trailer"
                          allowFullScreen
                          className={`w-full h-full border-0 transition-opacity duration-500 ${
                            iframeLoaded ? "opacity-100" : "opacity-0"
                          }`}
                          onLoad={() => setIframeLoaded(true)}
                        />
                      </div>
                    )}
                  </div>
                </DialogDescription>

                <DialogClose asChild>
                  <Button className="mt-6 w-full">Close</Button>
                </DialogClose>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Footer */}
        <footer className="border-t border-gray-300 dark:border-gray-700 px-6 py-6 text-sm text-muted-foreground select-none">
          <div className="mb-4">Questions? Contact us.</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-lg mx-auto">
            {[
              "FAQ",
            ].map((link) => (
              <Link key={link} href="#" className="hover:underline">
                {link}
              </Link>
            ))}
          </div>
        </footer>

      </div>
    </>
  );
}
