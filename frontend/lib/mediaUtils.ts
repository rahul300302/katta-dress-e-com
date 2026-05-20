export function isVideoUrl(url: string): boolean {
  if (!url) return false;
  return (
    /\/video\/upload\//i.test(url) ||
    /\.(mp4|webm|mov|m4v)($|\?)/i.test(url)
  );
}

export function slideIsVideo(slide: { mediaType?: string; media?: string; image?: string }): boolean {
  if (slide.mediaType === 'video') return true;
  return isVideoUrl(slide.media || slide.image || '');
}
