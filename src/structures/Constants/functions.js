import Humanize from "humanize-plus";
import {
    getActiveProfile,
    getProfile
} from "./constants.js";
import Client from "../client/Client.js";
import cachios from "cachios";

export const generateNetworthEmbed = async function (
    uuid,
    embed,
    name,
    embed2,
    cutename
) {
    const emoji = new Client().emoji;

    const profiles = await cachios.get(
        `https://api.hypixel.net/skyblock/profiles?key=${process.env.apiKey}&uuid=${uuid}`, {
            ttl: 60
        }
    );

    const emojis = await cachios.get(
        "https://raw.githubusercontent.com/Altpapier/Skyblock-Item-Emojis/main/emojis.json", {
            ttl: 60000
        }
    );

    let activeProfile;

    if (cutename) {
        activeProfile = getProfile(profiles.data.profiles, cutename);
    } else {
        activeProfile = getActiveProfile(profiles.data.profiles, uuid);
    }

    const profile = activeProfile.members[uuid];

    let response;

    profile.banking = activeProfile.banking;

    try {
        response = await cachios.post(
            `${process.env.API}maro/networth/categories`, {
                data: profile
            }, {
                ttl: 60,
                validateStatus: function (status) {
                    return (status >= 200 && status < 400) || status == 404;
                },
            }
        );
    } catch (e) {
        console.error(e);
    }

    if (response.data["status"] === 404) {
        return (
            embed2.addField("Networth:", response.data.cause) &&
            embed.setDescription(response.data["cause"])
        );
    }

    const res = response.data.data;

    embed2.addField(
        `Networth:`,
        "$" + Humanize.formatNumber(res.networth + res.bank + res.purse, 2)
    );

    embed
        .addFields({
            name: "<:gold_ingot:953850267005227068> Purse:",
            value: Humanize.compactInteger(res.purse, 2),
            inline: true,
        }, {
            name: "<:gold_block:953850482701525032> Bank",
            value: Humanize.compactInteger(res.bank, 2),
            inline: true,
        })
        .setDescription(
            `${name}'s Total Networth is **$${Humanize.formatNumber(
        res.networth + res.bank + res.purse,
        2
      )}** *$${Humanize.formatNumber(res.irl, 2)} IRL (USD)*`
        );

    if (res.sacks) {
        embed.addField(
            "<:Sack_Of_Sacks:936101156290191421> Sacks",
            Humanize.compactInteger(res.sacks, 2),
            true
        );
    }

    const inventories = {
        armor: "<:diamond_chesplate:953850266963284009> Armour",
        wardrobe_inventory: "<:armour_stand:953850267009445959> Wardrobe",
        inventory: "<:chest:953850266980085780> Inventory",
        enderchest: "<:enderchest:953849419650965516> Ender Chest",
        storage: "<:backpack:953849462055395409> Storage",
        pets: "<:ender_dragon_pet:953849461933764611> Pets",
        talismans: "<:hegemony:953849462080540772> Accessories",
    };

    let armorText = "";
    let wardrobe_inventoryText = "";
    let inventoryText = "";
    let enderchestText = "";
    let storageText = "";
    let petsText = "";
    let talismansText = "";

    let repeatArmor;
    let repeatWardrobe_inventory;
    let repeatInventory;
    let repeatEnderchest;
    let repeatStorage;
    let repeatPets;
    let repeatTalismans;

    if (res.categories.armor && res.categories.armor.total > 0) {
        const categoryArmor = res.categories.armor;
        if (4 < categoryArmor.top_items.length + 1) {
            repeatArmor = 4;
        } else if (4 > categoryArmor.top_items.length + 1) {
            repeatArmor = categoryArmor.top_items.length;
        }
        for (let i = 0; i < repeatArmor; i++) {
            if (categoryArmor.top_items[i].count > 1) {
                armorText += `${categoryArmor.top_items[i].count}x `;
            }
            if (categoryArmor.top_items[i].name) {
                armorText += categoryArmor.top_items[i].name;
            }
            if (categoryArmor.top_items[i].recomb) {
                armorText += " <:recomb:920527647400919060>";
            }
            if (categoryArmor.top_items[i].price) {
                armorText += ` *(${Humanize.compactInteger(
          categoryArmor.top_items[i].price,
          2
        )})*`;
            }
            armorText += "\n";
        }
    } else {
        armorText += "No Items tf";
    }

    if (
        res.categories.wardrobe_inventory &&
        res.categories.wardrobe_inventory.total > 0
    ) {
        const categoryWardrobe_inventory = res.categories.wardrobe_inventory;
        if (4 < categoryWardrobe_inventory.top_items.length) {
            repeatWardrobe_inventory = 4;
        } else if (4 > categoryWardrobe_inventory.top_items.length) {
            repeatWardrobe_inventory = categoryWardrobe_inventory.top_items.length;
        }
        for (let i = 0; i < repeatWardrobe_inventory; i++) {
            if (categoryWardrobe_inventory.top_items[i].count > 1) {
                wardrobe_inventoryText += `${categoryWardrobe_inventory.top_items[i]["count"]}x `;
            }
            if (categoryWardrobe_inventory.top_items[i].name) {
                wardrobe_inventoryText += categoryWardrobe_inventory.top_items[i].name;
            }
            if (categoryWardrobe_inventory.top_items[i].recomb) {
                wardrobe_inventoryText += " <:recomb:920527647400919060>";
            }
            if (categoryWardrobe_inventory.top_items[i].price) {
                wardrobe_inventoryText += ` *(${Humanize.compactInteger(
          categoryWardrobe_inventory.top_items[i].price,
          2
        )})*`;
            }
            wardrobe_inventoryText += "\n";
        }
    } else {
        wardrobe_inventoryText += "No Items tf";
    }

    if (res.categories.inventory && res.categories.inventory.total > 0) {
        const categoryInventory = res.categories.inventory;
        if (4 < categoryInventory.top_items.length) {
            repeatInventory = 4;
        } else if (4 > categoryInventory.top_items.length) {
            repeatInventory = categoryInventory.top_items.length;
        }
        for (let i = 0; i < repeatInventory; i++) {
            if (categoryInventory.top_items[i].count > 1) {
                inventoryText += `${categoryInventory.top_items[i]["count"]}x `;
            }
            if (categoryInventory.top_items[i].name) {
                inventoryText += categoryInventory.top_items[i].name;
            }
            if (categoryInventory.top_items[i].recomb) {
                inventoryText += " <:recomb:920527647400919060>";
            }
            if (categoryInventory.top_items[i].price) {
                inventoryText += ` *(${Humanize.compactInteger(
          categoryInventory.top_items[i].price,
          2
        )})*`;
            }
            inventoryText += "\n";
        }
    } else {
        inventoryText += "No Items tf";
    }

    if (res.categories.enderchest && res.categories.enderchest.total > 0) {
        const categoryEnderChest = res.categories.enderchest;
        if (4 < categoryEnderChest.top_items.length) {
            repeatEnderchest = 4;
        } else if (4 > categoryEnderChest.top_items.length) {
            repeatEnderchest = categoryEnderChest.top_items.length;
        }
        for (let i = 0; i < repeatEnderchest; i++) {
            if (categoryEnderChest.top_items[i].count > 1) {
                enderchestText += `${categoryEnderChest.top_items[i].count}x `;
            }
            if (categoryEnderChest.top_items[i].name) {
                enderchestText += categoryEnderChest.top_items[i].name;
            }
            if (categoryEnderChest.top_items[i].recomb) {
                enderchestText += " <:recomb:920527647400919060>";
            }
            if (categoryEnderChest.top_items[i].price) {
                enderchestText += ` *(${Humanize.compactInteger(
          categoryEnderChest.top_items[i].price,
          2
        )})*`;
            }
            enderchestText += "\n";
        }
    } else {
        enderchestText += "No Items tf";
    }

    if (res.categories.storage && res.categories.storage.total > 0) {
        const categoryStorage = res.categories.storage;
        if (4 < categoryStorage.top_items.length) {
            repeatStorage = 4;
        } else if (4 > categoryStorage.top_items.length) {
            repeatStorage = categoryStorage.top_items.length;
        }
        for (let i = 0; i < repeatStorage; i++) {
            if (categoryStorage.top_items[i].count > 1) {
                storageText += `${categoryStorage.top_items[i]["count"]}x `;
            }
            if (categoryStorage.top_items[i].name) {
                storageText += categoryStorage.top_items[i].name;
            }
            if (categoryStorage.top_items[i].recomb) {
                storageText += " <:recomb:920527647400919060>";
            }
            if (categoryStorage.top_items[i].price) {
                storageText += ` *(${Humanize.compactInteger(
          categoryStorage.top_items[i].price,
          2
        )})*`;
            }
            storageText += "\n";
        }
    } else {
        storageText += "No Items tf";
    }

    if (res.categories.pets && res.categories.pets.total > 0) {
        const categoryPets = res.categories.pets;
        if (4 < categoryPets.top_items.length) {
            repeatPets = 4;
        } else if (4 > categoryPets.top_items.length) {
            repeatPets = categoryPets.top_items.length;
        }
        for (let i = 0; i < repeatPets; i++) {
            if (categoryPets.top_items[i].count > 1) {
                petsText += `${categoryPets.top_items[i]["count"]}x `;
            }
            if (categoryPets.top_items[i].name) {
                petsText += categoryPets.top_items[i].name;
            }
            if (categoryPets.top_items[i].heldItem) {
                petsText += ` ${emoji[categoryPets.top_items[i].heldItem]}`;
                console.log(emoji[categoryPets.top_items[i].heldItem]);
            }
            if (categoryPets.top_items[i].price) {
                petsText += ` *(${Humanize.compactInteger(
          categoryPets.top_items[i].price,
          2
        )})*`;
            }
            petsText += "\n";
        }
    } else {
        petsText += "No Items tf";
    }

    if (res.categories.talismans && res.categories.talismans.total > 0) {
        const categoryTalismans = res.categories.talismans;
        if (4 < categoryTalismans.top_items.length) {
            repeatTalismans = 4;
        } else if (4 > categoryTalismans.top_items.length) {
            repeatTalismans = categoryTalismans.top_items.length;
        }
        for (let i = 0; i < repeatTalismans; i++) {
            if (categoryTalismans.top_items[i].count > 1) {
                talismansText += `${categoryTalismans.top_items[i]["count"]}x `;
            }
            if (categoryTalismans.top_items[i].name) {
                talismansText += categoryTalismans.top_items[i].name;
            }
            if (categoryTalismans.top_items[i].recomb) {
                talismansText += " <:recomb:920527647400919060>";
            }
            if (categoryTalismans.top_items[i].price) {
                talismansText += ` *(${Humanize.compactInteger(
          categoryTalismans.top_items[i].price,
          2
        )})*`;
            }
            talismansText += "\n";
        }
    } else {
        talismansText += "No Items tf";
    }

    const texts = {
        armor: armorText,
        wardrobe_inventory: wardrobe_inventoryText,
        inventory: inventoryText,
        enderchest: enderchestText,
        storage: storageText,
        pets: petsText,
        talismans: talismansText,
    };
    let txt;
    for (let item in inventories) {
        if (res.categories[item]) {
            const req = res.categories[item];
            if (req) {
                txt = Humanize.compactInteger(req.total, 2);
            } else if (!req) {
                txt = "$0";
            }
            embed.addField(inventories[item] + ` *($${txt})*`, `${texts[item]}`);
        }
    }

    return embed;
};
