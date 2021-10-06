const { Listener } = require('discord-akairo');
const { Guild } = require('discord.js')
const Prefix = require('../structures/models/Prefix');

class guildCreateListener extends Listener {
    constructor() {
        super('guildCreateListener', { 
            emitter: 'client',
            event: 'guildCreate'
        });
    }

    /**
     * @param {Guild} guild
     */

    async exec(guild) {
            let response = await Prefix.create({ 
                guildID: guild.id,
                guildPrefix: '-'
            });
            response.save();
    }

}
module.exports = guildCreateListener;