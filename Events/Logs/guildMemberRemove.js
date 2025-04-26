const { AuditLogEvent, EmbedBuilder, GuildMember } = require("discord.js");
const config = require("../../config.json");
const { getAuditLogEntry } = require("../../Functions/getAuditLogEntry.js");

module.exports = {
  name: "guildMemberRemove",
  /**
   * @param {GuildMember} member
   */
  async execute(member, client) {
    try {
      const { guild, user } = member;
      const logChannel = await guild.channels.fetch(config.logChannel);

      let moderator = null;
      let reason = "None specified.";
      let time = Date.now();
      let kicked = false;

      const kickLog = await getAuditLogEntry(
        guild,
        user.id,
        AuditLogEvent.MemberKick
      );

      if (kickLog) {
        moderator = kickLog.executor;
        reason = kickLog.reason || reason;
        time = kickLog.createdTimestamp;
        kicked = true;
      }

      if (!kicked) return;

      const kickEmbed = new EmbedBuilder()
        .setColor(16753920)
        .setAuthor({
          name: "〘👢〙 Member Kicked",
          iconURL: user.displayAvatarURL({ dynamic: true }),
        })
        .setDescription(`**${user.tag}** (<@${user.id}>) has been kicked.`)
        .setFields(
          {
            name: "Moderator",
            value: moderator
              ? `${moderator.tag} (<@${moderator.id}>)`
              : "Unknown Moderator",
            inline: true,
          },
          {
            name: "Reason",
            value: reason || "No reason provided.",
            inline: true,
          },
        )
        .setFooter({ text: `User ID: ${user.id}` })
        .setTimestamp(time);

      logChannel.send({ embeds: [kickEmbed] });
    } catch (error) {
      console.error("Error handling guildMemberRemove:", error);
    }
  },
};
