const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const fs = require("fs");
const path = require("path");

const warningsFile = path.join(__dirname, "../../Database/warnings.json");

function loadWarnings() {
  if (!fs.existsSync(warningsFile)) {
    fs.writeFileSync(warningsFile, JSON.stringify({}));
  }

  const data = fs.readFileSync(warningsFile, "utf-8");
  if (!data.trim()) return {};
  return JSON.parse(data);
}

function createButtons() {
  const backButton = new ButtonBuilder()
    .setCustomId("back")
    .setLabel("⏪ Back")
    .setStyle(ButtonStyle.Primary);

  const nextButton = new ButtonBuilder()
    .setCustomId("next")
    .setLabel("Next ⏩")
    .setStyle(ButtonStyle.Primary);

  const closeButton = new ButtonBuilder()
    .setCustomId("close")
    .setLabel("✖ Close")
    .setStyle(ButtonStyle.Danger);

  const row = new ActionRowBuilder().addComponents(backButton, nextButton, closeButton);
  return [row];
}

function createWarningEmbed(target, warning, index, total) {
  return new EmbedBuilder()
    .setColor(16776960)
    .setTitle(`Warnings for ${target.tag}`)
    .setDescription(`#${index + 1} of ${total}`)
    .setThumbnail(target.displayAvatarURL({ dynamic: true }))
    .addFields(
      {
        name: "Member",
        value: `${target.tag} (<@${target.id}>)`,
        inline: true,
      },
      {
        name: "Warned by",
        value: `<@${warning.moderator}>`,
        inline: true,
      },
      {
        name: "Reason",
        value: warning.reason,
        inline: false,
      },
      {
        name: "Date",
        value: `<t:${Math.floor(warning.timestamp / 1000)}:F>`,
        inline: false,
      }
    );
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warnings")
    .setDescription("View a member's warnings.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The member to check for warnings.")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const target = interaction.options.getUser("user");
    const warnings = loadWarnings();
    const userWarnings = warnings[target.id];

    if (!userWarnings || userWarnings.length === 0) {
      return await interaction.reply({
        content: "No warnings found for this member.",
        flags: MessageFlags.Ephemeral,
      });
    }

    let currentIndex = 0;

    const currentEmbed = createWarningEmbed(
      target,
      userWarnings[currentIndex],
      currentIndex,
      userWarnings.length
    );

    await interaction.reply({
      embeds: [currentEmbed],
      components: createButtons(),
      flags: MessageFlags.Ephemeral,
    });

    const message = await interaction.fetchReply();
    const collector = message.createMessageComponentCollector({
      time: 120_000,
    });

    let closedEarly = false;

    collector.on("collect", async (buttonInteraction) => {
      if (buttonInteraction.user.id !== interaction.user.id) {
        return await buttonInteraction.reply({
          content: "You cannot interact with this button.",
          flags: MessageFlags.Ephemeral,
        });
      }

      if (buttonInteraction.customId === "close") {
        await buttonInteraction.deferUpdate();
        try {
          await interaction.deleteReply();
        } catch (error) {
          console.error("Failed to delete ephemeral reply:", error);
        }
        closedEarly = true;
        collector.stop();
        return;
      }

      await buttonInteraction.deferUpdate();

      if (buttonInteraction.customId === "back") {
        currentIndex = (currentIndex - 1 + userWarnings.length) % userWarnings.length;
      } else if (buttonInteraction.customId === "next") {
        currentIndex = (currentIndex + 1) % userWarnings.length;
      }

      const updatedEmbed = createWarningEmbed(
        target,
        userWarnings[currentIndex],
        currentIndex,
        userWarnings.length
      );

      await interaction.editReply({
        embeds: [updatedEmbed],
        components: createButtons(),
      });
    });

    collector.on("end", async () => {
      if (closedEarly) return;
      
      try {
        await interaction.editReply({
          content:
            "Session expired. Re-run the /warnings command to start a new session.",
          embeds: [],
          components: [],
        });
      } catch (error) {
        console.error("Failed to update after collector end:", error);
      }
    });
  },
};
