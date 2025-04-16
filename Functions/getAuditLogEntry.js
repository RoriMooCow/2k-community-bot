const { AuditLogEvent, GuildAuditLogsEntry } = require("discord.js");

/**
 * @param {Guild} guild
 * @param {string} userId
 * @param {AuditLogEvent} actionType
 * @param {(GuildAuditLogsEntry) => boolean} [filterFn]
 * @param {number} [maxAttempts=5]
 * @param {number} [delayMs=500]
 * @returns {Promise<GuildAuditLogsEntry | null>}
 */
const getAuditLogEntry = async (
  guild,
  userId,
  actionType,
  filterFn = () => true,
  maxAttempts = 5,
  delayMs = 500
) => {
  const wait = (ms) => new Promise((res) => setTimeout(res, ms));

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const logs = await guild.fetchAuditLogs({
        limit: 5,
        type: actionType,
      });

      const entry = logs.entries.find(
        (entry) =>
          entry?.target?.id === userId &&
          entry?.executor &&
          filterFn(entry) &&
          Date.now() - entry.createdTimestamp < 10_000 // 10s freshness
      );

      if (entry) return entry;
    } catch (err) {
      console.error(`[AuditLog] Fetch failed (attempt ${attempt}):`, err);
    }

    await wait(delayMs);
  }

  return null;
};

module.exports = { getAuditLogEntry };
