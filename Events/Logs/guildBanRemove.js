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
      let time = Date.now();

      const unbanLog = await getAuditLogEntry(
        guild,
        user.id,
        AuditLogEvent.MemberBanRemove
      );

      if (unbanLog) {
        moderator = unbanLog.executor;
        time = unbanLog.createdTimestamp;
      }

      const unbanEmbed = new EmbedBuilder()
        .setColor(65280)
        .setAuthor({
          name: "〘🟢〙Member Unbanned",
          iconURL: user.displayAvatarURL({ dynamic: true }),
        })
        .setDescription(`**${user.tag}** (<@${user.id}>) has been unbanned.`)
        .setFields(
          {
            name: "Moderator",
            value: moderator
              ? `${moderator.tag} (<@${moderator.id}>)`
              : "Unknown Moderator",
            inline: true,
          },
        )
        .setFooter({ text: `User ID: ${user.id}` })
        .setTimestamp(time);

      logChannel.send({ embeds: [unbanEmbed] });
    } catch (error) {
      console.error("Error handling guildBanRemove:", error);
    }
  },
};
