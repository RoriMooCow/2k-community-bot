const { AuditLogEvent, EmbedBuilder, GuildMember } = require("discord.js");
const config = require("../../config.json");
const { getAuditLogEntry } = require("../../Functions/getAuditLogEntry.js");

module.exports = {
    name: "guildMemberRemove",
    /**
     * 
     * @param {GuildMember} member 
     */
    async execute(member, client) {
        const { guild, user } = member;
        const logChannel = await guild.channels.fetch(config.logChannel);

        let moderator = null;
        let reason = "None specified.";
        let time = `<t:${Math.floor(Date.now() / 1000)}:F>`;
        let kicked = false;

        const kickLog = await getAuditLogEntry(
            guild,
            user.id,
            AuditLogEvent.MemberKick
        );

        if (kickLog) {
            moderator = kickLog.executor;
            reason = kickLog.reason || reason;
            time = `<t:${Math.floor(kickLog.createdTimestamp / 1000)}:F>`;
            kicked = true;
        }

        if (!kicked) return;

        const kickEmbed = new EmbedBuilder()
            .setColor(16711680)
            .setAuthor({
                name: `${user.tag} has been kicked.`,
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
        
        logChannel.send({ embeds: [ kickEmbed ] })
    }
}