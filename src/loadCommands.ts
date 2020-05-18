import * as handler from "./Handler";
import * as fs from "fs";

export function loadCommands() {
    const commandFileName = fs
        .readdirSync("./dist/handlers")
        .filter((file) => file.endsWith(".js"));

    let handlers: handler.Handler[] = [];
    let watchers: handler.Handler[] = [];
    for (const filename of commandFileName) {
        const importedModule = require(`./handlers/${filename}`);

        if (importedModule && importedModule.default) {
            let cmdMod = importedModule.default;
            if (handler.isHandlerModule(cmdMod)) {
                console.log("Loading module: " + cmdMod.name + ".");
                cmdMod.handlers.forEach((cmd) => {
                    if (cmd.aliases) {
                        console.log('\t- "' + cmd.id + '"');
                        handlers.push(cmd);
                    } else {
                        console.log('\t- "' + cmd.id + '" [watcher]');
                        watchers.push(cmd);
                    }
                });
            } else if (handler.isHandler(cmdMod)) {
                if (cmdMod.aliases) {
                    console.log('- "' + cmdMod.id + '"');
                    handlers.push(cmdMod);
                } else {
                    console.log('- "' + cmdMod.id + '" [watcher]');
                    watchers.push(cmdMod);
                }
            }
        }
    }
    return { handlers, watchers };
}
