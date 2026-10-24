import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
    url: "https://blog.iurchenkov.com",
    title: "Andrei Iurchenkov",
    description:
      "Notes on software engineering, filesystems, and systems programming",
    author: "Andrei Iurchenkov",
    profile: "https://github.com/painhardcore",
    lang: "en",
    timezone: "Europe/Paris",
  },
  posts: { perPage: 6, perIndex: 4, scheduledPostMargin: 0 },
  features: {
    lightAndDarkMode: true,
    dynamicOgImage: true,
    showArchives: false,
    showBackButton: true,
    editPost: { enabled: false },
    search: "pagefind",
  },
  socials: [{ name: "github", url: "https://github.com/painhardcore" }],
  shareLinks: [],
});
