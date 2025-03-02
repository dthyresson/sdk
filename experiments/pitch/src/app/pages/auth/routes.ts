import { route, RouteDefinition } from "@redwoodjs/sdk/router";
import { LoginPage } from "./LoginPage";
import { sessions } from "@/session/store";
import { Context } from "@/worker";
import { Profile } from "./Profile";

export const authRoutes: RouteDefinition<Context>[] = [
  route("/login", [LoginPage]),
  route("/logout", async function ({ request }) {
    const headers = new Headers();
    await sessions.remove(request, headers);
    headers.set("Location", "/");

    return new Response(null, {
      status: 302,
      headers,
    });
  }),
  route("/profile", [Profile]),
];
