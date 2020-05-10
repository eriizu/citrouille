import * as discord from "discord.js";

let errorId: number = 1;

export class ReplyError extends Error {
    public replyWith: string;
    constructor(replyWith: string, reason: string) {
        super(reason);
        this.replyWith = replyWith;
    }

    public discharge(msg: discord.Message | discord.PartialMessage) {
        msg.channel.send(`🔴 ${this.replyWith}\n(ID d'erreur : ${errorId})`).catch((err) => {
            console.error("failed to reply to error");
            console.error(err);
        });
        console.log(`Reply with error: ${errorId++}: ${this.message}`);
    }
}

export function isReplyError(x: any): x is ReplyError {
    return typeof x.replyWith == "string" && typeof x.discharge == "function" && !x.replyTo;
}
