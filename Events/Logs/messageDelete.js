const { AuditLogEvent, EmbedBuilder, Message } = require("discord.js");
const config = require("../../config.json");
const { getAuditLogEntry } = require("../../Functions/getAuditLogEntry.js");

module.exports = {
  name: "messageDelete",
  /**
   * @param {Message} message
   */
  async execute(message, client) {
    try {
      if (!message.guild || message.partial || message.author.bot || !message) return;

      const { guild, author } = message;
      const logChannel = await guild.channels.fetch(config.logChannel);

      let moderator = null;
      let time = Date.now();

      const deleteLog = await getAuditLogEntry(
        guild,
        author.id,
        AuditLogEvent.MessageDelete
      );

      if (deleteLog) {
        moderator = deleteLog.executor;
        time = deleteLog.createdTimestamp;
      } else {
        return;
      }

      if (moderator.bot) return;

      const deleteEmbed = new EmbedBuilder()
        .setColor(16776960)
        .setAuthor({
          name: "〘🗑️〙 Message Deleted",
          iconURL: author.displayAvatarURL({ dynamic: true }),
        })
        .setDescription(`A message from **${author.tag}** (<@${author.id}>) was deleted.`)
        .addFields(
          {
            name: "Moderator",
            value: moderator
              ? `${moderator.tag} (<@${moderator.id}>)`
              : "Unknown Moderator",
            inline: true,
          },
        )
        .setFooter({ text: `User ID: ${author.id}` })
        .setTimestamp(time);

      logChannel.send({ embeds: [deleteEmbed] });
    } catch (error) {
      console.error("Error handling messageDelete:", error);
    }
  },
};
