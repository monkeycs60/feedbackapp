import { createSafeActionClient, DEFAULT_SERVER_ERROR_MESSAGE } from "next-safe-action";

export const actionClient = createSafeActionClient({
  handleServerError(e) {
    console.error("Action error:", e.message);
    return DEFAULT_SERVER_ERROR_MESSAGE;
  },
});

export const authenticatedAction = actionClient.use(async ({ next }) => {
  // TODO: Add your authentication logic here
  // For example, check if user is logged in via session/JWT
  const isAuthenticated = false; // Replace with actual auth check
  
  if (!isAuthenticated) {
    throw new Error("Unauthorized");
  }
  
  return next({
    ctx: {
      // Add user context here
      userId: "user-id", // Replace with actual user ID
    },
  });
});

export const unauthenticatedAction = actionClient;