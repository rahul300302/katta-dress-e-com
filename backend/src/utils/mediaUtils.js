export function isVideoUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return (
    /\/video\/upload\//i.test(url) ||
    /\.(mp4|webm|mov|m4v)($|\?)/i.test(url)
  );
}

export function inferMediaType(slide) {
  if (slide?.mediaType === 'video') return 'video';
  const media = String(slide?.media || slide?.image || '').trim();
  return isVideoUrl(media) ? 'video' : 'image';
}
