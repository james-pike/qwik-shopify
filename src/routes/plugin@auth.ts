import type { RequestHandler } from "@builder.io/qwik-city";

const USERNAME = "admin";
const PASSWORD = "Melissa";

export const onRequest: RequestHandler = async ({ request, send }) => {
  const auth = request.headers.get("authorization");

  if (auth) {
    const [scheme, encoded] = auth.split(" ");
    if (scheme === "Basic" && encoded) {
      const decoded = atob(encoded);
      const [user, pass] = decoded.split(":");
      if (user === USERNAME && pass === PASSWORD) {
        return;
      }
    }
  }

  send(
    new Response("Unauthorized", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="The Safety House"',
      },
    }),
  );
};
