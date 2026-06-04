const { REST, Routes } = require('discord.js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const configPath = path.join(__dirname, '..', 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

const commands = [
  {
    name: 'setlinkchannel',
    description: 'Designa este canal como el canal de links',
  },
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('Registrando comandos slash...');
    await rest.put(
      Routes.applicationGuildCommands(config.clientId, config.guildId),
      { body: commands },
    );
    console.log('Comandos registrados correctamente.');
  } catch (error) {
    console.error('Error al registrar comandos:', error);
  }
})();
