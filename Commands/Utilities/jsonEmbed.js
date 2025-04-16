const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("jsonembed")
    .setDescription("Upload a JSON file to convert it to a Discord embed.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageWebhooks)
    .addAttachmentOption((option) =>
      option
        .setName("file")
        .setDescription("Upload a JSON file containing an embed.")
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const file = interaction.options.getAttachment("file");

      if (!file.name.endsWith(".json")) return;

      const response = await fetch(file.url);
      const text = await response.text();

      const data = JSON.parse(text);
      if (!data.embeds || !Array.isArray(data.embeds)) return;

      await interaction.deferReply({ flags: ephemeral });
      await interaction.channel.send({ embeds: data.embeds });
      await interaction.deleteReply();
    } catch (error) {
      console.error("Failed to process embed JSON:", error);
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({
          content: "Failed to process JSON file.",
        });
      } else {
        await interaction.reply({
          content: "Failed to process JSON file.",
          flags: ephemeral,
        });
      }
    }
  },
};
