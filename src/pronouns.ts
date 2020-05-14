import * as discord from "discord.js";

const rolesCombinations = [
    {
        roleId: "606807806938447872",
        name: "elle",
        emote: "🌻",
    },
    {
        roleId: "606807957052588042",
        name: "il",
        emote: "🌸",
    },
    {
        roleId: "606808023108943872",
        name: "iel",
        emote: "🍀",
    },
    {
        roleId: "606808071834173451",
        name: "ael",
        emote: "🌼",
    },
];

export async function processReaction(
    reaction: discord.MessageReaction,
    user: discord.User,
    add: boolean
) {
    let roleComb: {
        roleId: string;
        name: string;
        emote: string;
    } = null;

    rolesCombinations.forEach((elem) => {
        if (elem.emote == reaction.emoji.name) roleComb = elem;
    });

    if (!roleComb) {
        return;
    }

    updatePronouns(reaction, user, add, roleComb);
}

async function updatePronouns(
    reaction: discord.MessageReaction,
    user: discord.User,
    add: boolean,
    roleComb: { roleId: string; name: string; emote: string }
) {
    try {
        let member = await reaction.message.guild.members.fetch(user);
        if (add) {
            await member.roles.add(roleComb.roleId);
            console.log("Added role " + roleComb.name + " to " + user.tag);
        } else {
            await member.roles.remove(roleComb.roleId);
            console.log("Removed role " + roleComb.name + " from " + user.tag);
        }
    } catch (err) {
        console.error("failed to update pronouns for: " + user.tag);
        console.error(err);
    }
}
