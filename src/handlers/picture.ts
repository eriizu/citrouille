import * as handler from "./../Handler";
import * as discord from "discord.js";
import * as picture from "../components/picture";
import * as assert from "assert";

async function handlerSubmit(
    msg: discord.Message,
    splitMsg: Array<string>
): Promise<handler.Result> {
    if (msg.member.hasPermission("ADMINISTRATOR")) {
        let nCompleted = 0;

        // On missing attachment
        if (!msg.attachments.size) {
            msg.channel.send("Je n'ai rien trouvé en pièce jointe à votre message.");
            return handler.Result.END;
        }

        // Add all attachments to database under the given album name
        for (let attachmentTuple of msg.attachments) {
            let att = attachmentTuple[1];
            try {
                await picture.db.new(splitMsg[0], att.url, msg.author, true);
                nCompleted += 1;
            } catch (err) {
                console.error("failed to save an image:");
                console.error(err);

                msg.channel
                    .send(":red_circle: Je n'ai pas réussi à sauvegarder cette image:", att)
                    .catch(console.error);
            }
        }

        let prefix: string;
        if (nCompleted == msg.attachments.size) prefix = ":green_circle: ";
        msg.channel
            .send(`${prefix}J'ai sauvegardé ${nCompleted}/${msg.attachments.size} images.`)
            .catch(console.error);
    } else {
        msg.channel.send("Seulement un admin peut ajouter des images.").catch(console.error);
    }
    return handler.Result.END;
}

const DEFAULT_PREFIX = "!";

async function handlerPictureSample(msg: discord.Message, split: Array<string>) {
    if (split.length && split[0].indexOf(DEFAULT_PREFIX) != -1) {
        let prefixSplit = split[0].split("!");
        let cmd = prefixSplit[1];

        try {
            let res = await picture.db.aggregate<picture.IPictureDocument>([
                { $match: { album: cmd } },
                { $sample: { size: 1 } },
            ]);
            assert(res, "aggregation didn't return anyting.");

            if (res.length) {
                await msg.channel.send("", new discord.MessageAttachment(res[0].link));
                return handler.Result.END;
            }
        } catch (err) {
            console.error("failed to retrieve picture");
            console.error(err);
        }
    }
    return handler.Result.CONTINUE;
}

let mod: handler.HandlerModule = {
    name: "picture",
    handlers: [
        {
            id: "submit",
            stopOnArgMissmatch: true,
            usage: "**!submit [nom d'album]**\n(Pensez à remplacer les crochets ET leur contenu.).",
            argNb: 1,
            aliases: ["submit"],
            exec: handlerSubmit,
        },
        {
            id: "random picture sampler",
            argNb: 0,
            exec: handlerPictureSample,
        },
    ],
};

export default mod;
