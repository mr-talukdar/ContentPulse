export function normalizeHashtags(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .flatMap((item) => normalizeHashtags(item))
      .filter((tag, index, tags) => tags.indexOf(tag) === index);
  }
  if (typeof value !== "string") return [];
  const hashtagMatches = value.match(/#[\p{L}\p{N}_-]+/gu);
  if (hashtagMatches?.length) return hashtagMatches;
  return value
    .split(/[\n,|]+/)
    .map((tag) => tag.trim().replace(/^['"`]+|['"`]+$/g, ""))
    .filter(Boolean)
    .map((tag) => (tag.startsWith("#") ? tag : `#${tag.replace(/^#+/, "")}`));
}

export function normalizeStringList(value: unknown): string[] {
  if (Array.isArray(value))
    return value.flatMap((item) => normalizeStringList(item)).filter(Boolean);
  if (typeof value !== "string") return [];
  return value
    .split(/\n|•|\u2022|\r/)
    .map((item) => item.trim())
    .filter(Boolean);
}
