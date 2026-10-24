import type { CollectionEntry } from "astro:content";
import { postFilter } from "./postFilter";

/** Published posts, newest publication first. */
export function getSortedPosts(posts: CollectionEntry<"posts">[]) {
  return posts
    .filter(postFilter)
    .sort(
      (a, b) => b.data.pubDatetime.getTime() - a.data.pubDatetime.getTime()
    );
}
