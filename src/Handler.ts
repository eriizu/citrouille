import * as discord from "discord.js";

export interface HandlerModule {
    name: string;
    handlers: Handler[];
    // helper?: (msg: discord.Message) => Promise<string[]>;
}

export enum Result {
    END,
    CONTINUE,
}

export interface Handler {
    id: string;
    aliases?: string[];
    argNb: number;
    stopOnArgMissmatch?: boolean;
    usage?: string;
    exec: (msg: discord.Message, splitMsg: string[]) => Promise<Result>;
}

/**
 * Indicates a match between a command and the message inputed.
 */
export function predicate(split: string[], cmd: Handler): boolean {
    if (!cmd.aliases || !cmd.aliases.length) return true;

    if (split.length && split[0]) {
        for (let alias of cmd.aliases) {
            if (alias == split[0]) return true;
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

/**
 * Indicates a match between a command and the message inputed.
 */
export function checkArgNumber(split: string[], cmd: Handler): boolean {
    return cmd.argNb == 0 || split.length - 1 >= cmd.argNb;
}

export function isHandler(x: any): x is Handler {
    return x.id && x.argNb !== undefined && typeof x.exec === "function";
}

export function isHandlerModule(x: any): x is HandlerModule {
    return Array.isArray(x.handlers);
}
