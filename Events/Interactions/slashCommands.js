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

    if (command.developer && interaction.user.id !== "133111159887888385")
      return interaction.reply({
        content:
          "You do not have permission to use this command. (Developer only)",
        flags: MessageFlags.Ephemeral,
      });

    command.execute(interaction, client);
  },
};
