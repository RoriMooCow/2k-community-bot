const { GuildBan, EmbedBuilder, AuditLogEvent } = require("discord.js");
const config = require("../../config.json");
const { getAuditLogEntry } = require("../../Functions/getAuditLogEntry.js");

module.exports = {
  name: "guildBanAdd",
  /**
   * @param {GuildBan} ban
   */
  async execute(ban, client) {
    try {
      const { user, guild } = ban;
      const logChannel = await guild.channels.fetch(config.logChannel);

      let moderator = null;
      let reason = "None specified.";
      let time = Date.now();

      const banLog = await getAuditLogEntry(
        guild,
        user.id,
        AuditLogEvent.MemberBanAdd
      );

      if (banLog) {
        moderator = banLog.executor;
        reason = banLog.reason || reason;
        time = banLog.createdTimestamp;
      }

      const banEmbed = new EmbedBuilder()
        .setColor(16711680)
        .setAuthor({
          name: `Member has been banned.`,
        })
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .addFields([
          {
            name: "Member",
            value: `${user.tag} (<@${user.id}>)`,
            inline: true,
          },
          {
            name: "Banned by",
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

      logChannel.send({ embeds: [banEmbed] });
    } catch (error) {
      console.error("Error handling guildBanAdd:", error);
    }
  },
};
