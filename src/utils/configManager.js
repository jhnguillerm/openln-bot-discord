const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '..', '..', 'config.json');

function readConfig() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
  } catch {
    return { linkChannelId: null };
  }
}

function writeConfig(data) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2));
}

function getLinkChannel() {
  return readConfig().linkChannelId;
}

function setLinkChannel(channelId) {
  const config = readConfig();
  config.linkChannelId = channelId;
  writeConfig(config);
}

module.exports = { getLinkChannel, setLinkChannel };
