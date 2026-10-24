// Match pre-rendered diagram variants to the site's explicit theme choice.
function syncDiagramTheme() {
  const dark = document.documentElement.dataset.theme === "dark";
  document
    .querySelectorAll<HTMLSourceElement>(".diagram-scroll source[media]")
    .forEach(source => {
      source.media = dark ? "all" : "not all";
    });
}

new MutationObserver(syncDiagramTheme).observe(document.documentElement, {
  attributes: true,
  attributeFilter: ["data-theme"],
});
document.addEventListener("astro:page-load", syncDiagramTheme);
syncDiagramTheme();
