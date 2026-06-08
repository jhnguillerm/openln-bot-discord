const MAX_DESC_LENGTH = 300;

function isWorkshopUrl(url) {
  return /steamcommunity\.com\/(?:sharedfiles|workshop)\/filedetails/i.test(url);
}

function truncate(text, max) {
  if (!text || text.length <= max) return text;
  return text.slice(0, max).replace(/\s+\S*$/, '') + '...';
}

function extractMetaTag(html, property) {
  const regex = new RegExp(
    `<meta\\s[^>]*property=["']${escapeRegExp(property)}["'][^>]*content=["']([^"']+)["']`,
    'i',
  );
  const match = regex.exec(html);
  if (match) return match[1];
  const regexAlt = new RegExp(
    `<meta\\s[^>]*content=["']([^"']+)["'][^>]*property=["']${escapeRegExp(property)}["']`,
    'i',
  );
  const matchAlt = regexAlt.exec(html);
  return matchAlt ? matchAlt[1] : null;
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function decodeHtmlEntities(text) {
  if (!text) return text;
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec));
}

async function fetchWorkshopData(url) {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DiscordBot/1.0)' },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) return null;

    const html = await response.text();

    const title = decodeHtmlEntities(extractMetaTag(html, 'og:title'));
    const description = decodeHtmlEntities(extractMetaTag(html, 'og:description'));
    const image = extractMetaTag(html, 'og:image');

    if (!title && !description && !image) return null;

    return {
      title: title || null,
      description: description ? truncate(description, MAX_DESC_LENGTH) : null,
      image: image || null,
    };
  } catch {
    return null;
  }
}

module.exports = { fetchWorkshopData, isWorkshopUrl };
