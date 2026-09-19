/**
 * Helper to clean and normalize any video/embed URL input
 * Handles raw <iframe> tags, Streamtape watch/embed links, YouTube links, Google Drive, etc.
 */
export function cleanAndNormalizeVideoUrl(input: string): string {
  if (!input) return "";
  let url = input.trim();

  // 1. If user pasted an entire <iframe> tag, extract src="..." or src='...'
  const iframeMatch = url.match(/<iframe[^>]*\ssrc=["']([^"']+)["']/i);
  if (iframeMatch && iframeMatch[1]) {
    url = iframeMatch[1].trim();
  }

  // 2. Streamtape normalization:
  // Convert /v/ (watch page) to /e/ (embed player)
  // Handles streamtape.com, streamtape.to, streamta.pe, streamtape.net, streamtape.xyz, etc.
  if (/(?:streamtape\.(?:com|to|net|pe|xyz|site|cash|cc)|streamta\.pe)\/(?:v|e)\/([a-zA-Z0-9_-]+)/i.test(url)) {
    url = url.replace(
      /(?:https?:\/\/)?(?:www\.)?(?:streamtape\.(?:com|to|net|pe|xyz|site|cash|cc)|streamta\.pe)\/(?:v|e)\/([a-zA-Z0-9_-]+)[^\s"']*/i,
      "https://streamtape.com/e/$1/"
    );
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = `https://${url}`;
    }
  }

  // 3. Abyss Player normalization:
  // Handles player.abyssplayer.com, abyss.to, abyssplayer.com links or raw slugs
  const abyssMatch = url.match(/(?:player\.abyssplayer\.com|abyssplayer\.com|abyss\.to)\/(?:[^\s"'/?#]+\/)?([a-zA-Z0-9_-]{4,})/i);
  if (abyssMatch && abyssMatch[1]) {
    url = `https://player.abyssplayer.com/${abyssMatch[1]}`;
  }

  // 4. Google Drive preview link
  if (url.includes("drive.google.com/file/d/")) {
    url = url.replace(/\/view(\?.*)?$/, "/preview");
  }

  return url;
}

/**
 * Returns a ready-to-embed URL for iframe src.
 */
export function getEmbedUrl(raw: string): string {
  if (!raw) return "";
  const cleaned = cleanAndNormalizeVideoUrl(raw);

  // 1. Abyss Player
  const abyssMatch = cleaned.match(/(?:player\.abyssplayer\.com|abyssplayer\.com|abyss\.to)\/(?:[^\s"'/?#]+\/)?([a-zA-Z0-9_-]{4,})/i);
  if (abyssMatch && abyssMatch[1]) {
    return `https://player.abyssplayer.com/${abyssMatch[1]}`;
  }

  // 2. Streamtape
  const stMatch = cleaned.match(/(?:streamtape\.(?:com|to|net|pe|xyz|site|cash|cc)|streamta\.pe)\/(?:v|e)\/([a-zA-Z0-9_-]+)/i);
  if (stMatch && stMatch[1]) {
    return `https://streamtape.com/e/${stMatch[1]}/`;
  }

  // 3. YouTube
  const ytRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const ytMatch = cleaned.match(ytRegExp);
  if (ytMatch && ytMatch[2].length === 11) {
    return `https://www.youtube.com/embed/${ytMatch[2]}?autoplay=1&rel=0`;
  }
  if (cleaned.length === 11 && !cleaned.includes("/") && !cleaned.includes(".")) {
    return `https://www.youtube.com/embed/${cleaned}?autoplay=1&rel=0`;
  }

  // 4. Google Drive
  if (cleaned.includes("drive.google.com/file/d/")) {
    return cleaned.replace(/\/view(\?.*)?$/, "/preview");
  }

  return cleaned;
}

/**
 * Detects if a URL is an HLS (.m3u8) stream
 */
export function isHlsUrl(raw: string): boolean {
  if (!raw) return false;
  const cleaned = cleanAndNormalizeVideoUrl(raw).toLowerCase();
  return (
    cleaned.includes(".m3u8") ||
    cleaned.includes("/hls/") ||
    cleaned.includes("/stream/hls") ||
    cleaned.endsWith(".m3u8")
  );
}
