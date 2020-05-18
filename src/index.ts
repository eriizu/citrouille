import * as discord from "discord.js";

const client = new discord.Client({ partials: ["MESSAGE", "CHANNEL", "REACTION"] });

client.on("ready", () => {
    console.log("Discord OK");
    client.user
        .setPresence({
            activity: { name: 'faites : "!aled"' },
        })
        .catch(console.warn);
});
client.login(process.env.CITROUILLE_DISCORD_TOKEN);

// Commented as no database is needed for this bot: yet.

// import * as mongoose from "mongoose";

// mongoose
//     .connect(process.env.MONGO_URL || `mongodb://root:example@localhost/citrouille?authSource=admin`, {
//         useNewUrlParser: true,
//         useCreateIndex: true,
//         useUnifiedTopology: true,
//         useFindAndModify: false,
//     })
//     .then(() => {
//         console.log("Mongo OK");
//     })
//     .catch(console.error);

import { loadCommands } from "./loadCommands";
import * as handler from "./Handler";

let handlers: handler.Handler[];
let watchers: handler.Handler[];
try {
    let res = loadCommands();
    handlers = res.handlers;
    watchers = res.watchers;
} catch {
    handlers = null;
    watchers = null;
}

import { isReplyError } from "./ReplyError";

const DEFAULT_PREFIX = "!";

client.on("message", async (msg) => {
    if (msg.partial) {
        console.log("The msg is partial.");
        try {
            msg = await msg.fetch();
        } catch (err) {
            console.log(err);
            return;
        }
    }

    // Ignore messages from self or another bot.
    if (msg.author.bot) return;

    let split = msg.content.split(" ");

    // Pre command handlers
    for (let watcher of watchers) {
        let res: handler.Result;
        try {
            res = await watcher.exec(msg, split);
        } catch (err) {
            console.error(err);
            return;
        }
        if (res == handler.Result.END) return;
    }

    if (!split.length || !handlers) {
        return;
    } else if (split[0].indexOf(DEFAULT_PREFIX)) {
        let prefixSplit = split[0].split("!");
        let prefix = prefixSplit[0];
        split[0] = prefixSplit[1] || "";

        // Commented as empty prefixes do not cause any issue with this particular bot.
        // if (!prefix || !prefix.length) {
        //     return;
        // }

        for (let hdl of handlers) {
            if (handler.predicate(split, hdl)) {
                split.shift();
                let res: handler.Result;
                try {
                    res = await hdl.exec(msg, split);
                } catch (err) {
                    if (isReplyError(err)) {
                        err.discharge(msg);
                    } else {
                        console.error(err);
                    }
                    return;
                }
                if (res === handler.Result.END) return;
            }
        }
    }
});

import * as pronouns from "./pronouns";

async function reactionProcess(
    reaction: discord.MessageReaction,
    user: discord.User | discord.PartialUser,
    add: boolean
) {
    try {
        if (reaction.partial) {
            reaction = await reaction.fetch();
        }
        if (user.partial) {
            user = await user.fetch();
        }

        if (reaction.message.id == "606807344759963688") {
            pronouns.processReaction(reaction, user as discord.User, add);
        }
    } catch (err) {
        if (false && isReplyError(err)) {
            err.discharge(reaction.message);
        } else {
            console.error(err);
        }
    }
}

client.on("messageReactionAdd", async (reaction, user) => {
    reactionProcess(reaction, user, true);
});
client.on("messageReactionRemove", async (reaction, user) => {
    reactionProcess(reaction, user, false);
});
