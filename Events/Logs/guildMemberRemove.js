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
        .setColor(16711680)
        .setAuthor({
          name: `Member has been kicked.`,
        })
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setFields([
          {
            name: "Member",
            value: `${user.tag} (<@${user.id}>)`,
            inline: true,
          },
          {
            name: "Kicked by",
            value: moderator
              ? `${moderator.tag} (<@${moderator.id}>)`
              : "Unknown",
            inline: true,
          },
          {
            name: "Reason",
            value: reason,
            inline: false,
          },
        ])
        .setTimestamp(time);

      logChannel.send({ embeds: [kickEmbed] });
    } catch (error) {
      console.error("Error handling guildMemberRemove:", error);
    }
  },
};
