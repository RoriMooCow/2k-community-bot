const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
  EmbedBuilder,
} = require("discord.js");
const config = require("../../config.json");
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

function saveWarnings(warnings) {
  fs.writeFileSync(warningsFile, JSON.stringify(warnings, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("removewarning")
    .setDescription("Remove a warning from a member.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The member to remove the warning from.")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("index")
        .setDescription("The index of the warning to remove.")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const logChannel = await interaction.guild.channels.fetch(
      config.logChannel
    );
    const target = interaction.options.getUser("user");
    const inputIndex = interaction.options.getInteger("index");
    const index = inputIndex - 1;
    const moderator = interaction.user;

    const warnings = loadWarnings();
    const userWarnings = warnings[target.id];

    if (!userWarnings || userWarnings.length === 0) {
      return await interaction.reply({
        content: "No warnings found for this member.",
        flags: MessageFlags.Ephemeral,
      });
    }

    if (index < 0 || index >= userWarnings.length) {
      return await interaction.reply({
        content: `Invalid index. Try using /warnings to review this member's warnings.`,
        flags: MessageFlags.Ephemeral,
      });
    }

    const removedWarning = userWarnings.splice(index, 1)[0];

    if (userWarnings.length === 0) {
      delete warnings[target.id];
    } else {
      warnings[target.id] = userWarnings;
    }

    saveWarnings(warnings);

    const unwarnEmbed = new EmbedBuilder()
      .setColor(65280)
      .setAuthor({
        name: "〘🟢〙 Warning Removed",
        iconURL: target.displayAvatarURL({ dynamic: true }),
      })
      .setDescription(`A warning was removed from **${target.tag}** (<@${target.id}>).`)
      .addFields(
        {
          name: "Removed by",
          value: `${moderator.tag} (<@${moderator.id}>)`,
          inline: true,
        },
        {
          name: "Originally warned by",
          value: `<@${removedWarning.moderator}> (ID: ${removedWarning.moderator})`,
          inline: true,
        },
        {
          name: "Warning Index",
          value: `#${index + 1}`,
          inline: true,
        },
        {
          name: "Original Reason",
          value: removedWarning.reason || "No reason provided.",
          inline: false,
        },
        {
          name: "Original Date",
          value: `<t:${Math.floor(removedWarning.timestamp / 1000)}:F>`,
          inline: false,
        },
      )
      .setFooter({ text: `User ID: ${target.id}` })
      .setTimestamp();

    logChannel.send({ embeds: [unwarnEmbed] });
    return await interaction.reply({
      content: `Removed warning #${index + 1} from ${target.tag}.`,
      flags: MessageFlags.Ephemeral,
    });
  },
};
