import * as discord from "discord.js";
import * as handler from "../Handler";

async function warnOnMention(msg: discord.Message | discord.PartialMessage, splitMsg: string[]) {
    // if (msg.mentions.members.size && !msg.member.hasPermission("ADMINISTRATOR")) {
    if (msg.mentions.members.size) {
        try {
            let emoji = msg.guild.emojis.cache.find((emoji) => emoji.id === "712056878531739678");
            await msg.react(emoji);
            await msg.channel.send(`${emoji}${emoji}${emoji}`);
        } catch (err) {
            console.warn(err);
        }

        try {
            let prom = Promise.all([msg.react("❌"), msg.react("⚠️"), msg.react("🚨")]);
            await msg.reply(
                `vous n'avez pas le droit de taguer sur ce serveur !!\n\nMerci d'aller voir à nouveau le règlement.\nLorsque vous citez quelqu'un, pensez à retirer la mention que Discord ajoute dans votre message.\nIl s'agit seulement d'un avertissement, faites attention par la suite.`
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
