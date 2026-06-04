const { Events } = require('discord.js');
const { getLinkChannel } = require('../utils/configManager');
const { handleMessage } = require('../handlers/linkHandler');

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.author.bot) return;
    if (!message.content) return;

    const linkChannelId = getLinkChannel();
    if (!linkChannelId || message.channelId !== linkChannelId) return;

    const urlRegex = /https?:\/\/[^\s]+/;
    if (!urlRegex.test(message.content)) return;

    await handleMessage(message);
  },
};
