type YouTubeProps = {
  /** YouTube video ID — the part after `v=` in the URL */
  id: string;
  /** Optional title shown above the embed */
  title?: string;
  /** Optional caption / blurb shown below the embed */
  caption?: string;
  /** Start time in seconds (optional) */
  start?: number;
};

/**
 * Privacy-enhanced YouTube embed (uses youtube-nocookie.com).
 * Lazy-loaded, fullscreen-capable, responsive 16:9 container.
 */
export default function YouTube({ id, title, caption, start }: YouTubeProps) {
  const params = new URLSearchParams({ rel: "0", modestbranding: "1" });
  if (start && start > 0) params.set("start", String(start));
  const src = `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;

  return (
    <figure className="my-8">
      {title ? (
        <figcaption className="mb-2 text-sm font-medium text-sand-700">
          {title}
        </figcaption>
      ) : null}
      <div
        className="relative w-full overflow-hidden rounded-xl border border-sand-200 bg-sand-100 shadow-sm"
        style={{ aspectRatio: "16 / 9" }}
      >
        <iframe
          src={src}
          title={title ?? "YouTube video"}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 h-full w-full"
        />
      </div>
      {caption ? (
        <figcaption className="mt-2 text-sm text-sand-600">{caption}</figcaption>
      ) : null}
    </figure>
  );
}
