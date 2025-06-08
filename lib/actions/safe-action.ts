import { createSafeActionClient, DEFAULT_SERVER_ERROR_MESSAGE } from "next-safe-action";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const actionClient = createSafeActionClient({
  handleServerError(e) {
    console.error("Action error:", e.message);
    return DEFAULT_SERVER_ERROR_MESSAGE;
  },
});

export const authenticatedAction = actionClient.use(async ({ next }) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  
  if (!session) {
    throw new Error("Unauthorized");
  }
  
  return next({
    ctx: {
      userId: session.user.id,
      user: session.user,
      session,
    },
  });
});

export const unauthenticatedAction = actionClient;