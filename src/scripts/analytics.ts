import { PUBLIC_POSTHOG_HOST, PUBLIC_POSTHOG_KEY } from "astro:env/client";

// Loaded lazily so the PostHog bundle never blocks first paint.
// `defaults` enables history_change pageviews, which covers ClientRouter navigations.
// CI passes unset repo variables as "", hence `||` rather than a schema default.
const key = PUBLIC_POSTHOG_KEY;
if (key) {
  void import("posthog-js").then(({ default: posthog }) => {
    posthog.init(key, {
      api_host: PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
      defaults: "2025-05-24",
      person_profiles: "identified_only",
    });
  });
}
