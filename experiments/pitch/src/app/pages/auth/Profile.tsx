import { Context } from "@/worker";
import { link } from "src/shared/links";

export function Profile({ ctx }: { ctx: Context }) {
  return (
    <div>
      <p>
        {ctx.session?.userId
          ? `You are logged in as user ${ctx.session.userId}`
          : "You are not logged in"}
      </p>
      {ctx.session?.userId && <a href={link("/user/logout")}>Logout</a>}
      {!ctx.session?.userId && <a href={link("/user/login")}>Go to Login</a>}
    </div>
  );
}
