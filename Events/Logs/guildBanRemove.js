const { GuildBan, EmbedBuilder, AuditLogEvent } = require("discord.js");
const config = require("../../config.json");
const { getAuditLogEntry } = require("../../Functions/getAuditLogEntry.js");

module.exports = {
  name: "guildBanRemove",
  /**
   * @param {GuildBan} unban
   */
  async execute(unban, client) {
    try {
      const { user, guild } = unban;
      const logChannel = await guild.channels.fetch(config.logChannel);

      let moderator = null;
      let reason = "None specified.";
      let time = Date.now();

      const unbanLog = await getAuditLogEntry(
        guild,
        user.id,
        AuditLogEvent.MemberBanRemove
      );

      if (unbanLog) {
        moderator = unbanLog.executor;
        reason = unbanLog.reason || reason;
        time = unbanLog.createdTimestamp;
      }

      const unbanEmbed = new EmbedBuilder()
        .setColor(65280)
        .setAuthor({
          name: `Member has been unbanned.`,
        })
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setFields([
          {
            name: "Member",
            value: `${user.tag} (<@${user.id}>)`,
            inline: true,
          },
          {
            name: "Unbanned by",
            value: moderator
              ? `${moderator.tag} (<@${moderator.id}>)`
              : "Unknown",
            inline: true,
          },
        ])
        .setTimestamp(time);

      logChannel.send({ embeds: [unbanEmbed] });
    } catch (error) {
      console.error("Error handling guildBanRemove:", error);
    }
  },
};
