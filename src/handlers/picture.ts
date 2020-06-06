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
            .send(`${prefix}J'ai sauvegardé ${nCompleted}/${msg.attachments.size} image·s.`)
            .catch(console.error);
    } else {
        msg.channel.send("Seulement un admin peut ajouter des images.").catch(console.error);
    }
    return handler.Result.END;
}

async function handlerList(msg: discord.Message, splitMsg: Array<string>): Promise<handler.Result> {
    try {
        let pictures = await picture.db.find({ album: splitMsg[0], validated: true }, { link: 1 });

        assert(pictures);

        if (!pictures.length) {
            msg.channel.send("Je n'ai pas trouvé d'images.");
        } else {
            let builder: string[] = ["J'ai trouvé les images suivantes :"];

            pictures.forEach((pic) => {
                builder.push("- " + pic._id + " `" + pic.link + "`");
            });

            builder.push(
                "Vous pouvez supprimer une image en faisant `!picdelete [id ou lien de l'image]` en tant qu'administateur."
            );

            msg.channel.send(builder.join("\n"));
        }
    } catch (err) {
        console.error("Failed to list images in album.");
        console.error(err);
    }

    return handler.Result.END;
}

async function handlerDelete(
    msg: discord.Message,
    splitMsg: Array<string>
): Promise<handler.Result> {
    if (msg.member.hasPermission("ADMINISTRATOR")) {
        try {
            let res = await picture.db.delete(splitMsg);
            if (res.deletedCount) {
                msg.channel.send("J'ai supprimé " + res.deletedCount + " image·s correspondante·s");
            } else {
                msg.channel.send("Je n'ai pas trouvé d'images correspondantes.");
            }
        } catch (err) {
            console.error("Failure when deleting images.");
            console.error(err);
        }
    } else {
        msg.channel.send("Seul un admin peut supprimer une image.");
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

async function aledHandler(msg: discord.Message, split: Array<string>) {
    try {
        let albums: string[] = await picture.db.distinct("album");

        if (!albums || !albums.length) {
            msg.channel.send("Je n'ai aucune commande associée à des images à vous montrer.");
            return handler.Result.END;
        } else {
            let builder: string[] = [];
            builder.push("**Commandes d'images :**");
            albums.forEach((name) => {
                builder.push(`- !${name}`);
            });

            msg.channel.send(builder.join("\n"));
        }
    } catch (err) {
        console.error("Failed to get album names");
        console.error(err);
    }
}

let mod: handler.HandlerModule = {
    name: "picture",
    handlers: [
        {
            id: "submit",
            stopOnArgMissmatch: true,
            usage: "**!add [nom d'album]**\n(Pensez à remplacer les crochets ET leur contenu.).",
            argNb: 1,
            aliases: ["add"],
            exec: handlerSubmit,
        },
        {
            id: "list",
            stopOnArgMissmatch: true,
            usage: "**!list [nom d'album]**\n(Pensez à remplacer les crochets ET leur contenu.).",
            argNb: 1,
            aliases: ["list"],
            exec: handlerList,
        },
        {
            id: "delete",
            stopOnArgMissmatch: true,
            usage:
                "**!delete [id ou lien de photo]**\n(Pensez à remplacer les crochets ET leur contenu.).",
            argNb: 1,
            aliases: ["delete"],
            exec: handlerDelete,
        },
        {
            id: "aled",
            stopOnArgMissmatch: false,
            argNb: 0,
            aliases: ["aled"],
            exec: aledHandler,
        },
        {
            id: "random picture sampler",
            argNb: 0,
            exec: handlerPictureSample,
        },
    ],
};

export default mod;
