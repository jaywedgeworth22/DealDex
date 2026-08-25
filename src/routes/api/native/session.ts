import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/native/session")({
  server: {
    handlers: {
      POST: async () =>
        Response.json(
          {
            error:
              "Email and password sign-in is gone. Use Google, Apple, or X on the website or in the app.",
          },
          { status: 410 },
        ),
    },
  },
});
