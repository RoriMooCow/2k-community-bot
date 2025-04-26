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
          name: "〘⛔〙 Member Banned",
          iconURL: user.displayAvatarURL({ dynamic: true }),
        })
        .setDescription(`**${user.tag}** (<@${user.id}>) has been banned.`)
        .addFields(
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

      logChannel.send({ embeds: [banEmbed] });
    } catch (error) {
      console.error("Error handling guildBanAdd:", error);
    }
  },
};
