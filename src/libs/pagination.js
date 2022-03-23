import {
    Interaction,
    MessageActionRow,
    Message,
    MessageEmbed,
    MessageButton,
} from "discord.js";
import {
    AkairoMessage
} from "discord-akairo";

/**
 * Creates a pagination embed
 * @param {Interaction} interaction
 * @param {MessageEmbed[]} pages
 * @param {MessageButton[]} buttonList
 * @param {number} timeout
 * @returns
 */
export const paginationEmbed = async (
    interaction,
    pages,
    buttonList,
    timeout = 120000
) => {
    if (!pages) throw new Error("Pages are not given.");
    if (!buttonList) throw new Error("Buttons are not given.");
    if (buttonList[0].style === "LINK" || buttonList[1].style === "LINK")
        throw new Error(
            "Link buttons are not supported with discordjs-button-pagination"
        );
    if (buttonList.length !== 2) throw new Error("Need two buttons.");

    let page = 0;

    const row = new MessageActionRow().addComponents(buttonList);

    //has the interaction already been deferred? If not, defer the reply.
    if (interaction.deferred == false) {
        await interaction.deferReply();
    }

    const curPage = await interaction.editReply({
        embeds: [pages[page].setFooter(`Page ${page + 1} / ${pages.length}`)],
        components: [row],
        fetchReply: true,
    });

    const filter = (i) =>
        i.customId === buttonList[0].customId ||
        i.customId === buttonList[1].customId;

    const collector = await curPage.createMessageComponentCollector({
        filter,
        time: timeout,
    });

    collector.on("collect", async (i) => {
        switch (i.customId) {
            case buttonList[0].customId:
                page = page > 0 ? --page : pages.length - 1;
                break;
            case buttonList[1].customId:
                page = page + 1 < pages.length ? ++page : 0;
                break;
            default:
                break;
        }
        await i.deferUpdate();
        await i.editReply({
            embeds: [pages[page].setFooter(`Page ${page + 1} / ${pages.length}`)],
            components: [row],
        });
        collector.resetTimer();
    });

    collector.on("end", () => {
        if (!curPage.deleted) {
            const disabledRow = new MessageActionRow().addComponents(
                buttonList[0].setDisabled(true),
                buttonList[1].setDisabled(true)
            );
            curPage.edit({
                embeds: [pages[page].setFooter(`Page ${page + 1} / ${pages.length}`)],
                components: [disabledRow],
            });
        }
    });

    return curPage;
};

/**
 * Creates a pagination embed
 * @param {Message} message
 * @param {MessageEmbed[]} pages
 * @param {MessageButton[]} buttonList
 * @param {number} timeout
 * @returns
 */
export const pagination = async (
    message,
    pages,
    buttonList,
    timeout = 120000
) => {
    if (!pages) throw new Error("Pages are not given.");
    if (!buttonList) throw new Error("Buttons are not given.");
    if (buttonList[0].style === "LINK" || buttonList[1].style === "LINK")
        throw new Error(
            "Link buttons are not supported with discordjs-button-pagination"
        );

    let page = 0;

    buttonList[2] = buttonList[1];

    buttonList.fill(
        new MessageButton()
        .setCustomId("pagebutton")
        .setStyle("PRIMARY")
        .setLabel(`${page} / ${pages.length}`),
        1,
        2
    );

    const row = new MessageActionRow().addComponents(buttonList);

    row.components[1].setLabel(`${page + 1} / ${pages.length}`);

    const curPage = await message.edit({
        embeds: [pages[page]],
        components: [row],
        fetchReply: true,
    });

    const filter = (i) =>
        i.customId === buttonList[0].customId ||
        i.customId === buttonList[2].customId;

    const collector = await curPage.createMessageComponentCollector({
        filter,
        time: timeout,
    });

    collector.on("collect", async (i) => {
        switch (i.customId) {
            case buttonList[0].customId:
                page = page > 0 ? --page : pages.length - 1;
                break;
            case buttonList[2].customId:
                page = page + 1 < pages.length ? ++page : 0;
                break;
            default:
                break;
        }
        await i.deferUpdate();
        row.components[1].setLabel(`${page + 1} / ${pages.length}`);
        await i.editReply({
            embeds: [pages[page]],
            components: [row],
        });
        collector.resetTimer();
    });

    collector.on("end", async () => {
        if (!curPage.deleted) {
            await curPage.edit({
                embeds: [pages[page]],
                components: [],
            });
        }
    });

    return curPage;
};
