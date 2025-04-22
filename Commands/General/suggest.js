const {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");
const config = require("../../config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("suggest")
    .setDescription("Submit a suggestion or feedback.")
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("What is this suggestion about?")
        .setRequired(true)
        .addChoices(
          {
            name: "Discord",
            value: "discord",
          },
          {
            name: "Game",
            value: "game",
          },
          {
            name: "Other",
            value: "other",
          }
        )
    )
    .addStringOption((option) =>
      option
        .setName("suggestion")
        .setDescription("Describe your suggestion.")
        .setRequired(true)
    ),

  async execute(interaction) {
    const type = interaction.options.getString("type");
    const suggestion = interaction.options.getString("suggestion");

    const forumChannelId = config.forumChannelId;
    const forumChannel = await interaction.guild.channels.fetch(forumChannelId);

    const tags = {
      discord: "Discord",
      game: "Game",
      other: "Other",
    };

    const selectedTag = forumChannel.availableTags.find(
      (tag) => tag.name.toLowerCase() === tags[type].toLowerCase()
    );

    const suggestEmbed = new EmbedBuilder()
      .setAuthor({
        name: `${interaction.user.displayName} submitted a suggestion.`,
      })
      .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
      .addFields([
        { name: `Suggestion Type:`, value: tags[type] },
        { name: "Suggestion", value: suggestion },
      ])
      .setColor(Math.floor(Math.random() * 0xffffff))
      .setTimestamp();

    const thread = await forumChannel.threads.create({
      name: `[${tags[type]}] ${interaction.user.displayName}'s Suggestion`,
      message: {
        embeds: [suggestEmbed],
      },
      appliedTags: selectedTag ? [selectedTag.id] : [],
    });

    await interaction.reply({
      content: `Suggestion successfully posted: [View Thread](${thread.url})`,
      flags: MessageFlags.Ephemeral,
    });
  },
};
