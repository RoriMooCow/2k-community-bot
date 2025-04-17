const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

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
    const file = interaction.options.getAttachment("file");

    if (!file.name.endsWith(".json")) {
      return await interaction.reply({
        content: "Invalid file. Please upload a '.json' file.",
        flags: MessageFlags.Ephemeral,
      });
    }

    try {
      const response = await fetch(file.url);
      const json = await response.json();

      const embeds = (json.embeds || []).map((data) => EmbedBuilder.from(data));

      const components = (json.components || []).map((row) => {
        const newRow = new ActionRowBuilder();

        for (const component of row.components) {
          const isLinkButton = component.style === ButtonStyle.Link;

          if (isLinkButton && component.custom_id) {
            delete component.custom_id;
          }

          const button = new ButtonBuilder()
            .setStyle(component.style)
            .setLabel(component.label || "")
            .setDisabled(component.disabled || false);

          if (component.emoji) button.setEmoji(component.emoji);
          if (component.url) button.setURL(component.url);
          else if (component.custom_id) button.setCustomId(component.custom_id);

          newRow.addComponents(button);
        }

        return newRow;
      });

      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      await interaction.channel.send({ embeds, components });
      await interaction.deleteReply();
    } catch (error) {
      console.error("Failed to process embed JSON:", error);
      await interaction.reply({
        content: "Failed to process JSON file.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
