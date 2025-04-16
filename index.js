const { Client, GatewayIntentBits, Partials, Collection } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.MessageContent,
  ],
  partials: [
    Partials.User,
    Partials.Channel,
    Partials.Message,
    Partials.GuildMember,
    Partials.ThreadMember,
  ],
});

client.config = require("./config.json");
client.commands = new Collection();
client.events = new Collection();

const { loadEvents } = require("./Handlers/eventHandler");
loadEvents(client);

client.login(client.config.token);
