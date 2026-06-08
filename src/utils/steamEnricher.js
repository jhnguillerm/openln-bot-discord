const MAX_DESC_LENGTH = 300;

function isWorkshopUrl(url) {
  return /steamcommunity\.com\/(?:sharedfiles|workshop)\/filedetails/i.test(url);
}

function truncate(text, max) {
  if (!text || text.length <= max) return text;
  return text.slice(0, max).replace(/\s+\S*$/, '') + '...';
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

function extractMetaTag(html, property) {
  const patterns = [
    new RegExp(
      `<meta\\s[^>]*property=["']${escapeRegExp(property)}["'][^>]*content=["']([^"']+)["']`,
      'i',
    ),
    new RegExp(
      `<meta\\s[^>]*content=["']([^"']+)["'][^>]*property=["']${escapeRegExp(property)}["']`,
      'i',
    ),
    new RegExp(
      `<meta\\s[^>]*name=["']${escapeRegExp(property)}["'][^>]*content=["']([^"']+)["']`,
      'i',
    ),
    new RegExp(
      `<meta\\s[^>]*content=["']([^"']+)["'][^>]*name=["']${escapeRegExp(property)}["']`,
      'i',
    ),
  ];
  for (const regex of patterns) {
    const match = regex.exec(html);
    if (match) return match[1];
  }
  return null;
}

function extractTags(html) {
  const tagRegex = /requiredtags(?:%5B%5D|\[\])=([^"&'\]>]+)/gi;
  const tags = [];
  let match;
  while ((match = tagRegex.exec(html)) !== null) {
    const tag = decodeHtmlEntities(match[1]);
    if (tag && !tags.includes(tag)) {
      tags.push(tag);
    }
  }
  return tags.length > 0 ? tags : null;
}

function extractDescriptionFromBody(html) {
  const patterns = [
    /<div[^>]*class=["'][^"']*workshopItemDescription[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
    /<div[^>]*class=["'][^"']*description[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
  ];
  for (const regex of patterns) {
    const match = regex.exec(html);
    if (match) {
      const text = match[1]
        .replace(/<[^>]+>/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      if (text.length > 20) return text;
    }
  }
  return null;
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

    let description =
      decodeHtmlEntities(extractMetaTag(html, 'og:description')) ||
      decodeHtmlEntities(extractMetaTag(html, 'Description')) ||
      decodeHtmlEntities(extractDescriptionFromBody(html));

    if (description) description = truncate(description, MAX_DESC_LENGTH);

    const image = extractMetaTag(html, 'og:image');
    const tags = extractTags(html);

    if (!title && !image) return null;

    return {
      title: title || null,
      description: description || null,
      image: image || null,
      tags: tags || null,
    };
  } catch {
    return null;
  }
}

module.exports = { fetchWorkshopData, isWorkshopUrl };
