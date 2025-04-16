const { GuildBan, EmbedBuilder, AuditLogEvent } = require("discord.js");
const config = require("../../config.json");
const { getAuditLogEntry } = require("../../Functions/getAuditLogEntry.js");

module.exports = {
    name: "guildBanRemove",
    /**
     * @param {GuildBan} unban 
     */
    async execute(unban, client) {
        const { user, guild } = unban;
        const logChannel = await guild.channels.fetch(config.logChannel);
        
        let moderator = null;
        let reason = "None specified."
        let time = `<t:${Math.floor(Date.now() / 1000)}:F>`;

        const unbanLog = await getAuditLogEntry(
            guild,
            user.id,
            AuditLogEvent.MemberBanRemove
        );

        if (unbanLog) {
            moderator = unbanLog.executor;
            reason = unbanLog.reason || reason;
            time = `<t:${Math.floor(unbanLog.createdTimestamp / 1000)}:F>`;
        }

        const unbanEmbed = new EmbedBuilder()
            .setColor(65280)
            .setAuthor({
                name: `${user.tag} has been unbanned.`,
                iconURL: user.displayAvatarURL()
            })
            .setFields(
                {
                    name: "Moderator",
                    value: moderator
                        ? `${moderator.tag} (<@${moderator.id}>)`
                        : "Unknown"
                },
                {
                    name: "Date",
                    value: time
                }
            );
        
        logChannel.send({ embeds: [ unbanEmbed ] });
    }
};