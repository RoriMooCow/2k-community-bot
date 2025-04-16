const { ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits, Client, MessageFlags } = require("discord.js");
const { loadCommands } = require("../../Handlers/commandHandler");
const { loadEvents } = require("../../Handlers/eventHandler");

module.exports = {
    developer: true,
    data: new SlashCommandBuilder()
        .setName("reload")
        .setDescription("Reloads commands/events.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand((options) => options
            .setName("commands")
            .setDescription("Reload commands."))
        .addSubcommand((options) => options
            .setName("events")
            .setDescription("Reloads events.")),
        /**
         * @param {ChatInputCommandInteraction} interaction 
         * @param {Client} client 
         */
        async execute(interaction, client) {
            const subCommand = interaction.options.getSubcommand();

            switch(subCommand) {
                case "commands" : {
                    loadCommands(client);
                    interaction.reply({
                        content: "Reloaded commands.",
                        flags: MessageFlags.Ephemeral
                    })
                }
                break;
                case "events" : {
                    for(const [key, value] of client.events)
                        client.removeListener(`${key}`, value, true);
                        loadEvents(client);
                        interaction.reply({
                            content: "Reloaded events.",
                            flags: MessageFlags.Ephemeral
                        })
                }
                break;
            }
        }
}