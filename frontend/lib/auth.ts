export function getSiteOrigin() {
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
}

export function getGoogleAuthUrl(redirectAfter?: string) {
  const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  const redirect = redirectAfter || `${getSiteOrigin()}/auth/callback`;
  return `${api}/auth/google?redirect=${encodeURIComponent(redirect)}`;
}

export function getOAuthCallbackUrl(redirectPath = '/products') {
  return `${getSiteOrigin()}/auth/callback?redirect=${encodeURIComponent(redirectPath)}`;
}