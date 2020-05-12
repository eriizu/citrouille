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
    if (!split.length || !ncmds) {
        return;
    } else if (split[0].indexOf(DEFAULT_PREFIX)) {
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

async function updatePronouns(reaction: discord.MessageReaction, user: discord.User, add: boolean) {
    let rolesCombinations = [
        {
            roleId: "606807806938447872",
            emote: "🌻",
        },
        {
            roleId: "606807957052588042",
            emote: "🌸",
        },
        {
            roleId: "606808023108943872",
            emote: "🍀",
        },
        {
            roleId: "606808071834173451",
            emote: "🌼",
        },
    ];

    let roleId: string = null;

    rolesCombinations.forEach((elem) => {
        if (elem.emote == reaction.emoji.name) roleId = elem.roleId;
    });

    if (!roleId) {
        return;
    }

    try {
        let member = await reaction.message.guild.members.fetch(user);
        if (add) {
            await member.roles.add(roleId);
            console.log("Added role " + roleId + " to " + user.tag);
        } else {
            await member.roles.remove(roleId);
            console.log("Removed role " + roleId + " from " + user.tag);
        }
    } catch (err) {
        console.error("failed to update pronouns for: " + user.tag);
        console.error(err);
    }
}

client.on("messageReactionAdd", async (reaction, user) => {
    try {
        if (reaction.partial) {
            reaction = await reaction.fetch();
        }
        if (user.partial) {
            user = await user.fetch();
        }

        if (reaction.message.id == "606807344759963688") {
            updatePronouns(reaction, user as discord.User, true);
        }
    } catch (err) {
        if (false && isReplyError(err)) {
            err.discharge(reaction.message);
        } else {
            console.error(err);
        }
    }
});

client.on("messageReactionRemove", async (reaction, user) => {
    try {
        if (reaction.partial) {
            reaction = await reaction.fetch();
        }
        if (user.partial) {
            user = await user.fetch();
        }

        if (reaction.message.id == "606807344759963688") {
            updatePronouns(reaction, user as discord.User, false);
        }
    } catch (err) {
        if (false && isReplyError(err)) {
            err.discharge(reaction.message);
        } else {
            console.error(err);
        }
    }
});
