import * as discord from "discord.js";

let errorId: number = 1;

export class ReplyDm {
    public replyWith: string;
    public replyTo: string;
    constructor(replyWith: string, replyTo: string) {
        this.replyWith = replyWith;
        this.replyTo = replyTo;
    }

    public async discharge(client: discord.Client) {
        try {
            let target = await client.users.fetch(this.replyTo);
            await target.send(this.replyWith);
        } catch (err) {
            console.error(err);
        }
    }
}

export function isReplyDm(x: any): x is ReplyDm {
    return (
        typeof x.replyWith == "string" &&
        typeof x.replyTo == "string" &&
        typeof x.discharge == "function"
    );
}
