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

  if (!data.trim()) {
    return {};
  }

  return JSON.parse(data);
}

function saveWarnings(data) {
  fs.writeFileSync(warningsFile, JSON.stringify(data, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Warn a member.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to warn.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("The reason for the warning.")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const logChannel = await interaction.guild.channels.fetch(
      config.logChannel
    );
    const target = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason");
    let moderator = interaction.user;
    let time = Date.now();

    if (target.bot) {
      return await interaction.reply({
        content: "You cannot warn bots.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const warnings = loadWarnings();

    if (!warnings[target.id]) {
      warnings[target.id] = [];
    }

    const warning = {
      moderator: moderator.id,
      reason: reason,
      timestamp: time,
    };

    warnings[target.id].push(warning);

    saveWarnings(warnings);

    const warnEmbed = new EmbedBuilder()
      .setColor(16776960)
      .setAuthor({
        name: "〘⚠️〙 Member Warned",
        iconURL: target.displayAvatarURL({ dynamic: true }),
      })
      .setDescription(`**${target.tag}** (<@${target.id}>) has been warned.`)
      .addFields(
        {
          name: "Moderator",
          value: `${moderator.tag} (<@${moderator.id}>)`,
          inline: true,
        },
        {
          name: "Reason",
          value: reason || "No reason provided.",
          inline: true,
        },
      )
      .setFooter({ text: `User ID: ${target.id}` })
      .setTimestamp(time);

    await interaction.reply({
      content: "Member has been warned.",
      flags: MessageFlags.Ephemeral,
    });
    logChannel.send({ embeds: [warnEmbed] });
  },
};
