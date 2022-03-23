import {
    AkairoClient,
    CommandHandler,
    InhibitorHandler,
    ListenerHandler,
} from "discord-akairo";
import {
    Intents,
    Message,
    MessageEmbed
} from "discord.js";
import winston from "winston";
import mongoose from "mongoose";
import Prefix from "../models/Prefix.js";
import Statcord from "statcord.js";
import dotenv from "dotenv";
import schedule from "node-schedule";
import cachios from "cachios";
import {
    online
} from "../Constants/constants.js";
import wait from "wait";

dotenv.config();

export default class Client extends AkairoClient {
    constructor() {
        super({
            ownerID: ["686844201190555668", "545129735970226177"],
            superUserID: ["686844201190555668", "545129735970226177"],
        }, {
            disableMentions: "everyone",
            intents: [
                Intents.FLAGS.GUILDS,
                Intents.FLAGS.GUILD_MESSAGES,
                Intents.FLAGS.DIRECT_MESSAGES,
                Intents.FLAGS.GUILD_MEMBERS,
            ],
        });

        const customlog = winston.createLogger({
            level: "info",
            format: winston.format.printf(
                (log) => `[${log.level.toUpperCase()}] - ${log.message}`
            ),
            colorize: true,
            transports: [
                new winston.transports.Console(),
                new winston.transports.File({
                    filename: "error.log",
                    level: "error"
                }),
                new winston.transports.File({
                    filename: "combined.log"
                }),
            ],
        });

        /**
         * @param {Message | AkairoMessage} message
         */

        this.prefix = async (message) => {
            const prefixDb = await Prefix.findOne({
                guildID: message.guildId
            });
            const prefixGuildPrefix = prefixDb.get("guildPrefix");
            return prefixGuildPrefix;
        };

        this.logging = customlog;

        this.emoji = {
            PET_ITEM_ALL_SKILLS_BOOST_COMMON: "<:all_skills_exp_boost:940149902971908096>",
            ALL_SKILLS_SUPER_BOOST: "<:all_skills_exp_super_boost:940149980113567764>",
            ANTIQUE_REMEDIES: "<:antique_remedies:940149981686427668>",
            PET_ITEM_BIG_TEETH_COMMON: "<:big_teeth:940149981443162183>",
            BIGGER_TEETH: "<:bigger_teeth:940149982806302820>",
            PET_ITEM_BUBBLEGUM: "<:bubblegum:940149980121948210>",
            PET_ITEM_COMBAT_SKILL_BOOST_COMMON: "<:combat_exp_boost_20:940149983393501184>",
            PET_ITEM_COMBAT_SKILL_BOOST_UNCOMMON: "<:combat_exp_boost_30:940149983448018984>",
            PET_ITEM_COMBAT_SKILL_BOOST_RARE: "<:combat_exp_boost_40:940149983150211073>",
            PET_ITEM_COMBAT_SKILL_BOOST_EPIC: "<:combat_exp_boost_50:940149983494148106>",
            DWARF_TURTLE_SHELMET: "<:dwarf_turtle_shelmet:940149983485767720>",
            PET_ITEM_FLYING_PIG: "<:enchanted_feather:940149980398772224>",
            PET_ITEM_EXP_SHARE: "<:exp_share:940149983494164521>",
            PET_ITEM_FARMING_SKILL_BOOST_COMMON: "<:farming_exp_boost_20:940149983645155349>",
            PET_ITEM_FARMING_SKILL_BOOST_UNCOMMON: "<:farming_exp_boost_30:940149983582253096>",
            PET_ITEM_FARMING_SKILL_BOOST_RARE: "<:farming_exp_boost_40:940149983632588870>",
            PET_ITEM_FARMING_SKILL_BOOST_EPIC: "<:farming_exp_boost_50:940149983582253097>",
            PET_ITEM_FISHING_SKILL_BOOST_COMMON: "<:fishing_exp_boost_20:940149983703871498>",
            PET_ITEM_FISHING_SKILL_BOOST_UNCOMMON: "<:fishing_exp_boost_30:940149983586426900>",
            PET_ITEM_FISHING_SKILL_BOOST_RARE: "<:fishing_exp_boost_40:940149983695482890>",
            PET_ITEM_FISHING_SKILL_BOOST_EPIC: "<:fishing_exp_boost_50:940149983615791144>",
            PET_ITEM_FORAGING_SKILL_BOOST_COMMON: "<:foraging_exp_boost_20:940149983678726154>",
            PET_ITEM_FORAGING_SKILL_BOOST_UNCOMMON: "<:foraging_exp_boost_30:940149983615782982>",
            PET_ITEM_FORAGING_SKILL_BOOST_RARE: "<:foraging_exp_boost_40:940149983645167656>",
            PET_ITEM_FORAGING_SKILL_BOOST_EPIC: "<:foraging_exp_boost_50:940149983666135080>",
            GOLD_CLAWS: "<:gold_claws:940149983670304778>",
            PET_ITEM_IRON_CLAWS_COMMON: "<:iron_claws:940149983745822720>",
            PET_ITEM_HARDENED_SCALES_UNCOMMON: "<:hardened_scales:940149982563008512>",
            REINFORCED_SCALES: "<:reinforced_scales:940149983775178802>",
            PET_ITEM_TOY_JERRY: "<:jerry_3d_glasses:940149983494148107>",
            PET_ITEM_LUCKY_CLOVER: "<:lucky_clover:940149983796138024>",
            MINOS_RELIC: "<:minos_relic:940149981308911636>",
            PET_ITEM_QUICK_CLAW: "<:quick_claw:940149981334097960>",
            REAPER_GEM: "<:reaper_gem:940149981334106122>",
            PET_ITEM_SPOOKY_CUPCAKE: "<:spooky_cupcake:940149981443162182>",
            PET_ITEM_TIER_BOOST: "<:tier_boost:940149983397695538>",
            CROCHET_TIGER_PLUSHIE: "<:tiger_plushie:940149981539602472>",
            PET_ITEM_VAMPIRE_FANG: "<:vampire_fang:940149983804530688>",
            PET_ITEM_TEXTBOOK: "<:textbook:940149983636779058>",
            PET_ITEM_MINING_SKILL_BOOST_COMMON: "<:mining_exp_boost_20:940149983745810432>",
            PET_ITEM_MINING_SKILL_BOOST_UNCOMMON: "<:mining_exp_boost_30:940149983779364874>",
            PET_ITEM_MINING_SKILL_BOOST_RARE: "<:mining_exp_boost_40:940149985415147540>",
            PET_ITEM_MINING_SKILL_BOOST_EPIC: "<:mining_exp_boost_50:940149983808733204>",
            WASHED_UP_SOUVENIR: "<:souvenir:953854278898941962>",
        };

        this.colour = Math.floor(Math.random() * 16777215).toString(16);

        this.commandHandler = new CommandHandler(this, {
            directory: "./src/commands",
            prefix: this.prefix,
            handleEdits: true,
            commandUtil: true,
            autoRegisterSlashCommands: true,
            allowMention: true,
            blockBots: true,
            defaultCooldown: 10000,
            autoDefer: true,
            typing: false,
            automateCategories: true,
        });
        this.inhibitorHandler = new InhibitorHandler(this, {
            directory: "./src/inhibitors",
        });
        this.listenerHandler = new ListenerHandler(this, {
            directory: "./src/listeners",
        });
    }
    async run(client) {
        await this.commandHandler.loadAll();
        this.commandHandler.useListenerHandler(this.listenerHandler);
        await this.listenerHandler.loadAll();
        this.commandHandler.useInhibitorHandler(this.inhibitorHandler);
        await this.inhibitorHandler.loadAll();
        mongoose
            .connect(process.env.MONGODBURI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            })
            .then(() => {
                this.logging.log("info", "Connected To MongoDB");
            })
            .catch((e) => {
                this.logging.log("error", e);
            });

        const statcord = new Statcord.Client({
            key: process.env.statcordKey,
            client,
            postCpuStatistics: false,
            postMemStatistics: false,
            postNetworkStatistics: false,
        });
        await this.login(process.env.token);
        await wait(1000);

        await statcord.autopost();

        statcord.on("post", (status) => {
            if (!status) console.log("Successful post");
            else console.error(status);
        });

        const channel = this.channels.cache.get(process.env.FRAGBOT_CHANNEL);

        const msg = await channel.send("Status SUS");

        const job = await schedule.scheduleJob("5 * * * *", async function () {
            const req = await cachios.get(
                `https://api.hypixel.net/status?key=${process.env.apiKey}&uuid=${process.env.FRAGBOT_UUID}`, {
                    ttl: 59
                }
            );
            const embed = new MessageEmbed()
                .setTitle("Fragbot Status")
                .setDescription("**" + online[req.data.session.online] + "**")
                .setTimestamp();
            await msg.edit({
                embeds: [embed],
                content: "Fragbot Status"
            });
            console.log("Edited Message");
        });
    }
}
