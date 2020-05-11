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

let ncmds: command.Command[];
try {
    ncmds = loadCommands();
} catch {
    ncmds = null;
}

import * as command from "./commands";
import { isReplyError } from "./ReplyError";

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

    // Pre command handlers
    // Currently, only the only thing we look
    if (msg.mentions.members.size) {
        console.log(msg.mentions.members);
        if (!msg.member.hasPermission("ADMINISTRATOR")) {
            try {
                let prom = Promise.all([msg.react("❌"), msg.react("⚠️"), msg.react("🚨")]);
                await msg.reply(
                    `vous n'avez pas le droit de taguer sur ce serveur !!\n\nMerci d'aller voir à nouveau le règlement.\nLorsque vous citez quelqu'un, pensez à retirer la mention que discord ajoute dans votre message.\nIl s'agit seulement d'un avertissement, faites attention par la suite.`
                );
                await prom;
                return;
            } catch (err) {
                console.error(err);
            }
        }
    }

    let split = msg.content.split(" ");
    if (!split.length) {
        return;
    } else if (split[0].indexOf("!")) {
        let prefixSplit = split[0].split("!");
        let prefix = prefixSplit[0];
        split[0] = prefixSplit[1] || "";

        // Commented as empty prefixes do not cause any issue with this particular bot.
        // if (!prefix || !prefix.length) {
        //     return;
        // }

        for (let cmd of ncmds) {
            if (command.predicate(prefix, split, cmd)) {
                let nbToShift = cmd.scope.length;
                while (nbToShift--) {
                    split.shift();
                }
                try {
                    await cmd.handler(msg, split);
                } catch (err) {
                    if (isReplyError(err)) {
                        err.discharge(msg);
                    } else {
                        console.error(err);
                    }
                }
                return;
            }
        }
    }
});

client.on("messageReactionAdd", async (reaction, user) => {
    if (reaction.partial) {
        // If the message this reaction belongs to was removed the fetching might result in an API error, which we need to handle
        try {
            await reaction.fetch();
        } catch {
            return;
        }
    }
    if (user.partial) {
        try {
            await user.fetch();
        } catch {
            return;
        }
    }

    try {
        if (reaction.message.author.id == client.user.id) {
            // await handleQueueJoin(reaction, user as discord.User);
        }
    } catch (err) {
        if (isReplyError(err)) {
            err.discharge(reaction.message);
        } else {
            console.error(err);
        }
    }
});
