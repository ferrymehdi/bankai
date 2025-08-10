import { currentUser } from "@clerk/nextjs/server";
import HomeClient from "./homeClient";
import animeData from "@/lib/animeData";

export default async function Page() {
  const topAnime = await animeData.top.getTopAnime({ limit: 20 }).catch(() => ({
    data: [],
  }));

  const user = await currentUser();
  const isSignedIn = !!user;

  return <HomeClient isSignedIn={isSignedIn} topAnime={topAnime.data ?? []} />;
}
