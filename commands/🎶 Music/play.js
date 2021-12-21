const Discord = require(`discord.js`);
const {
  MessageEmbed
} = require(`discord.js`);
const config = require(`../../botconfig/config.json`);
const ee = require(`../../botconfig/embed.json`);
const emoji = require(`../../botconfig/emojis.json`);
const playermanager = require(`../../handlers/playermanager`);
module.exports = {
  name: `play`,
  category: `🎶 Music`,
  aliases: [`p`],
  description: `Plays a song from youtube`,
  usage: `play <Song / URL>`,
  parameters: {"type":"music", "activeplayer": false, "previoussong": false},
  run: async (client, message, args, cmduser, text, prefix, player) => {
    try{
      //if no args return error
      if (!args[0])
        return message.channel.send(new MessageEmbed()
          .setColor(ee.wrongcolor)
          .setTitle(`${emoji.msg.ERROR} ผิดพลาด | คุณต้องให้ URL หรือคำค้นหากับฉัน.`)
        );
          message.channel.send(new MessageEmbed()
          .setColor(ee.color)
          .setTitle(`**กำลังค้นหา** 🔎`)
          .setDescription(`\`\`\`${text}\`\`\``)
        ).then(msg=>{
          msg.delete({timeout: 5000}).catch(e=>console.log("Could not delete, this prevents a bug"))
        })

      //play the SONG from YOUTUBE
      playermanager(client, message, args, `song:youtube`);
    } catch (e) {
      console.log(String(e.stack).bgRed)
      return message.channel.send(new MessageEmbed()
        .setColor(ee.wrongcolor)
        .setTitle(`${emoji.msg.ERROR} ERROR | An error occurred`)
        .setDescription(`\`\`\`${e.message}\`\`\``)
      );
    }
  }
};
