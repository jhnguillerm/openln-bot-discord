const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { platforms } = require('../utils/linkPatterns');

function extractUrl(text) {
  const urlRegex = /https?:\/\/[^\s]+/;
  const match = urlRegex.exec(text);
  return match ? match[0].replace(/[.,;:!?)]+$/, '') : null;
}

function detectPlatform(url) {
  return platforms.find((p) => p.test(url)) || null;
}

async function handleMessage(message) {
  const url = extractUrl(message.content);
  if (!url) return;

  const platform = detectPlatform(url);

  const embed = new EmbedBuilder()
    .setColor(platform ? platform.color : 0x5865F2)
    .setTitle('🔗 Enlace detectado')
    .setDescription(`\`${url}\``)
    .setTimestamp();

  const buttons = [
    new ButtonBuilder()
      .setStyle(ButtonStyle.Link)
      .setURL(url)
      .setLabel('🌐 Abrir en navegador'),
  ];

  let extraMessage = null;

  if (platform) {
    embed.setAuthor({ name: platform.name });

    if (platform.hasApp) {
      const appUri = platform.getAppUri(url);
      if (appUri) {
        const workerUrl = `https://openln-redirect.guiyeermas0.workers.dev/r?uri=${encodeURIComponent(appUri)}`;
        buttons.push(
          new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setURL(workerUrl)
            .setLabel(`🚀 Abrir en ${platform.name}`),
        );
      } else {
        extraMessage = `⚠️ Este enlace de **${platform.name}** solo se puede abrir en el navegador.`;
      }
    } else {
      extraMessage = `⚠️ Este enlace de **${platform.name}** solo se puede abrir en el navegador.`;
    }
  } else {
    extraMessage = '⚠️ Este enlace no tiene una aplicación compatible, solo se puede abrir en el navegador.';
  }

  const row = new ActionRowBuilder().addComponents(buttons);

  await message.reply({
    embeds: [embed],
    components: [row],
    content: extraMessage,
  });
}

module.exports = { handleMessage };
