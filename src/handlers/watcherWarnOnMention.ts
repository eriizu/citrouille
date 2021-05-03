import * as discord from "discord.js";
import * as handler from "../Handler";

function wasJuliaMentioned(msg: discord.Message) {
    for (let user of msg.mentions.users.array()) {
        if (user.id == "350629483042177025") return true;
    }
    return false;
}

async function warnOnMention(msg: discord.Message, splitMsg: string[]) {
    // if (wasJuliaMentioned(msg)) {
    if (wasJuliaMentioned(msg) && !msg.member.hasPermission("ADMINISTRATOR")) {
        try {
            let emoji = msg.guild.emojis.cache.find((emoji) => {
                return emoji.id === "519852990119673871";
            });
            await msg.react(emoji);
            await msg.channel.send(`${emoji}${emoji}${emoji}`);
        } catch (err) {
            console.warn(err);
        }

        try {
            let prom = Promise.all([msg.react("❌"), msg.react("⚠️"), msg.react("🚨")]);
            await msg.reply(
                `vous n'avez pas le droit de taguer Julia !!\n\nMerci d'aller voir à nouveau le règlement.\nLorsque vous la citez, pensez à retirer la mention que Discord ajoute dans votre message.\nIl s'agit seulement d'un avertissement, faites attention par la suite.`
            );
            await prom;
        } catch (err) {
            console.error(err);
        }
        return handler.Result.END;
    }
    return handler.Result.CONTINUE;
}

export const hdl: handler.Handler = {
    argNb: 0,
    exec: warnOnMention,
    id: "watch warn on mention",
};

export default hdl;
