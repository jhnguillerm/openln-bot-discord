const { fetchWorkshopData, isWorkshopUrl } = require('./steamEnricher');

const platforms = [
  {
    name: 'Steam',
    color: 0x171a21,
    test: (url) => /steam(?:community|powered)?\.com\//i.test(url),
    getAppUri: (url) => {
      return `steam://openurl/${encodeURIComponent(url)}`;
    },
    hasApp: true,
    enrich: async (url) => {
      if (isWorkshopUrl(url)) {
        return await fetchWorkshopData(url);
      }
      return null;
    },
  },
  {
    name: 'Epic Games',
    color: 0x2a2a2a,
    test: (url) => /store\.epicgames\.com\//i.test(url),
    getAppUri: (url) => {
      const match = url.match(/\/p\/([^/?]+)/);
      if (match) return `com.epicgames.launcher://apps/${match[1]}?action=launch`;
      return null;
    },
    hasApp: true,
  },
  {
    name: 'Battle.net',
    color: 0x00aeff,
    test: (url) => /(?:shop\.)?battle\.net\//i.test(url),
    getAppUri: () => null,
    hasApp: false,
  },
];

module.exports = { platforms };
