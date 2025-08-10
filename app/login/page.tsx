import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import LoginClient from "./LoginClient";

export default async function LoginPage() {
  const user = await currentUser();

  if (user) {
    // Redirect server-side to /browse if logged in
    redirect("/browse");
  }

  // Otherwise render client login page
  return <LoginClient />;
}
