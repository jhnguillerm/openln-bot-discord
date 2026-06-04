const { SlashCommandBuilder } = require('discord.js');
const { setLinkChannel } = require('../utils/configManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setlinkchannel')
    .setDescription('Designa este canal como el canal de links'),
  async execute(interaction) {
    setLinkChannel(interaction.channelId);
    await interaction.reply({
      content: `✅ Este canal (<#${interaction.channelId}>) ha sido designado como el canal de links.`,
      ephemeral: true,
    });
  },
};
