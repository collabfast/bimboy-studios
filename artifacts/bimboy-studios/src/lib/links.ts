export const BIMBOY_DOMAIN = "www.bimboy.com";

export function accountPath(handle: string): string {
  return `/${handle}/`;
}

export function accountUrlLabel(handle: string): string {
  return `${BIMBOY_DOMAIN}/${handle}/`;
}

export function accountUrl(handle: string): string {
  return `https://${BIMBOY_DOMAIN}/${handle}/`;
}
