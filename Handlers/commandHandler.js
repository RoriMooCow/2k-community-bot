const { loadFiles } = require("../Functions/fileLoader");

async function loadCommands(client) {
  console.time("Commands Loaded");
  client.commands = new Map();
  const commands = new Array();
  const commandsNames = new Array();

  const files = await loadFiles("Commands");

  for (const file of files) {
    try {
      const command = require(file);
      client.commands.set(command.data.name, command);
      commands.push(command.data.toJSON());
      commandsNames.push({ Command: command.data.name, Status: "  (:  " });
    } catch (error) {
      const commandName = file.split("/").pop().slice(0, -3);
      console.error(`Failed to load ${commandName}:`, error);
      commandsNames.push({ Command: commandName, Status: "  ):  " });
    }
  }

  await client.application.commands.set(commands);

  console.table(commandsNames, ["Command", "Status"]);
  console.info("\n\x1b[36m%s\x1b[0m", "Loaded Commands.");
  console.timeEnd("Commands Loaded");
}

module.exports = { loadCommands };
