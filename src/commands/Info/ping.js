const { Command } = require('discord-akairo');
const { MessageEmbed } = require('discord.js');

class PingCommand extends Command {
    constructor() {
        super('ping', {
            aliases: ['ping'],
        });
    }
    async exec(message) {
        const sent = await message.util.reply('Pong!');
        const pingEmbed = new MessageEmbed()
        .setColor('#0099ff')
        .setFields(
        { name: '🏓 Roundtrip latency: ', value: `${sent.createdTimestamp - sent.createdTimestamp}ms`}
    )
        .setFooter('Made By Strqtz', 'https://i.imgur.com/QZVPXDSh.jpg');
        message.util.reply({ embeds: [pingEmbed] });
    }
}

module.exports = PingCommand;