const { GuildBan, EmbedBuilder, AuditLogEvent } = require("discord.js");
const config = require("../../config.json"); 
const { getAuditLogEntry } = require("../../Functions/getAuditLogEntry.js");

module.exports = {
    name: "guildBanAdd",
    /**
     * @param {GuildBan} ban 
     */
    async execute(ban, client) {
        const { user, guild } = ban;
        const logChannel = await guild.channels.fetch(config.logChannel);
        
        let moderator = null;
        let reason = "None specified."
        let time = `<t:${Math.floor(Date.now() / 1000)}:F>`;

        const banLog = await getAuditLogEntry(
            guild,
            user.id,
            AuditLogEvent.MemberBanAdd
        );

        if (banLog) {
            moderator = banLog.executor;
            reason = banLog.reason || reason;
            time = `<t:${Math.floor(banLog.createdTimestamp / 1000)}:F>`;
        }

        const banEmbed = new EmbedBuilder()
            .setColor(16711680)
            .setAuthor({
                name: `${user.tag} has been banned.`,
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
                    name: "Reason",
                    value: reason
                },
                {
                    name: "Date",
                    value: time
                }
            );
        
        logChannel.send({ embeds: [ banEmbed ] });
    }
};