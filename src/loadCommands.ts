import * as Command from "./commands";
import * as fs from "fs";

export function loadCommands() {
    const commandFileName = fs
        .readdirSync("./dist/commands")
        .filter((file) => file.endsWith(".js"));

    let commands: Command.Command[] = [];
    for (const filename of commandFileName) {
        const importedModule = require(`./commands/${filename}`);

        if (importedModule && importedModule.default) {
            let cmdMod = importedModule.default;
            if (Command.isCommandModule(cmdMod)) {
                console.log("Loading module: " + cmdMod.name + ".");
                let prefix = cmdMod.prefix;
                cmdMod.commands.forEach((cmd) => {
                    cmd.prefix = prefix;
                    if (cmd.prefix) console.log('\t- "' + cmd.prefix + "!" + cmd.scope + '"');
                    else console.log('\t- "' + cmd.scope + '"');
                    commands.push(cmd);
                });
            }
        }
    }
    return commands;
}
