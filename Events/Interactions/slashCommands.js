const { ChatInputCommandInteraction, MessageFlags } = require("discord.js");

module.exports = {
  name: "interactionCreate",
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  execute(interaction, client) {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command)
      return interaction.reply({
        content: "This command is outdated.",
        flags: MessageFlags.Ephemeral,
      });

    command.execute(interaction, client);
  },
};
