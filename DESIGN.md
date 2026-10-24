# Reading design

Use AstroPaper 6.1.0 as the visual authority. The site is a narrow editorial
column with a compact header, text navigation, article lists, and a quiet footer.
The homepage introduces the author and topics, then shows the latest writing
or an explicit empty state. No promotional sections or decorative motion.

Tokens live in `src/styles/theme.css`. Preserve the theme's light paper,
dark blue background, blue light-mode links, and orange dark-mode links.
Typography uses AstroPaper's Google Sans Code, served locally by Astro's Fonts
API. Article body line height, scrollable code and tables, and visible keyboard
focus take priority over visual effects.

Read mode applies to every route. Diagrams and equations render during builds;
the browser only handles navigation, search, theme choice, and copy controls.
