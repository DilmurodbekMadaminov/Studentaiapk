export function getAbsoluteApiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : '/' + path;
  // Always return relative path in browser environment so fetch relies on current origin/proxy
  return cleanPath;
}

