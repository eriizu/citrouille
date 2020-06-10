import * as discord from "discord.js";

const client = new discord.Client({ partials: ["MESSAGE", "CHANNEL", "REACTION"] });

client.on("ready", () => {
    console.log("Discord OK");
    client.user
        .setPresence({
            activity: { name: 'faites : "!aled"', type: "PLAYING" },
        })
        .catch(console.warn);
});
client.login(process.env.CITROUILLE_DISCORD_TOKEN);

// Commented as no database is needed for this bot: yet.

import * as mongoose from "mongoose";

mongoose
    .connect(process.env.MONGO_URL || `mongodb://root:example@localhost/citrouille`, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        authSource: "admin",
    })
    .then(() => {
        console.log("Mongo OK");
    })
    .catch(console.error);

import { loadCommands } from "./loadCommands";
import * as handler from "./Handler";

let handlers: handler.Handler[];
let watchers: handler.Handler[];
try {
    let res = loadCommands();
    handlers = res.handlers;
    watchers = res.watchers;
} catch (err) {
    console.error(err);
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
    if (watchers)
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

    let isCmd = false;
    if (split.length && split[0].indexOf(DEFAULT_PREFIX) != -1) {
        let prefixSplit = split[0].split("!");
        if (split[0].length) return;
        split[0] = prefixSplit[1] || "";
        isCmd = true;
    }

    if (handlers && isCmd && split[0] && split[0].length) {
        for (let hdl of handlers) {
            if (handler.predicate(split, hdl)) {
                if (handler.checkArgNumber(split, hdl)) {
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
                } else if (hdl.stopOnArgMissmatch) {
                    if (hdl.usage) msg.channel.send("Utilisation de la commande :\n" + hdl.usage);
                    else
                        msg.channel.send(
                            `:red_circle: Je m'attendais à ${hdl.argNb} argument·s pour la commande ${hdl.aliases[0]}.`
                        );
                    return;
                }
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
