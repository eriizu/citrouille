// import * as discord from "discord.js";

export class NextCommandError extends Error {
    constructor(reason: string) {
        super(reason);
    }

    public continue(): boolean {
        return true;
    }
}

export function isNextCommandError(x: any): x is NextCommandError {
    return typeof x.continue == "function" && x.continue === true;
}
