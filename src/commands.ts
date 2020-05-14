import * as discord from "discord.js";

export interface CommandModule {
    name: string;
    commands: Command[];
    prefix?: string;
}

export interface Command {
    id: string;
    aliases?: string[];
    argNb: number;
    stopOnArgMissmatch?: boolean;
    handler: (msg: discord.Message | discord.PartialMessage, splitMsg: string[]) => Promise<void>;
    helper?: Function;
}

/**
 * Indicates a match between a command and the message inputed.
 */
export function predicate(split: string[], cmd: Command): boolean {
    if (!cmd.aliases || !cmd.aliases.length) return true;

    if (split.length && split[0]) {
        for (let alias of cmd.aliases) {
            if (alias == split[0] && split.length - 1 >= cmd.argNb) return true;
        }
    }

    return false;

    // if (split.length >= cmd.scope.length + cmd.argNb) {
    //     if (cmd.prefix == prefix) {
    //         let i = 0;
    //         for (let toMatch of cmd.scope) {
    //             if (toMatch != split[i++]) return false;
    //         }
    //         return true;
    //     }
    // } else {
    //     return false;
    // }
}

export function isCommand(x: any): x is Command {
    return x.id && x.argNb !== undefined && typeof x.handler === "function";
}

export function isCommandModule(x: any): x is CommandModule {
    return Array.isArray(x.commands);
}
