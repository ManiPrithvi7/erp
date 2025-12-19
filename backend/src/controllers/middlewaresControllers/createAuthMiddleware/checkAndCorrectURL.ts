export function checkAndCorrectURL(url: string): string {
  // detect if it has http or https:
  const hasHttps = url.startsWith('https://');

  // Remove "http://" or "https://" if present
  let cleanedUrl = url.replace(/^https?:\/\//i, '');

  // Remove trailing slashes
  cleanedUrl = cleanedUrl.replace(/\/+$/, '');

  const httpType = hasHttps ? 'https://' : 'http://';
  return httpType + cleanedUrl;
}

export default checkAndCorrectURL;

