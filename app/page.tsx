import { currentUser } from "@clerk/nextjs/server";
import HomeClient from "./homeClient";
import jikan from "@/lib/jikan";

export default async function Page() {
  const topAnime = await jikan.top.getTopAnime({ limit: 20 }).catch(() => ({
    data: [],
  }));

  const user = await currentUser();
  const isSignedIn = !!user;

  return <HomeClient isSignedIn={isSignedIn} topAnime={topAnime.data ?? []} />;
}
