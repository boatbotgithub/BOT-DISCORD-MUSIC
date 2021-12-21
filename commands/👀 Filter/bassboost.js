const {
  MessageEmbed
} = require(`discord.js`);
const config = require(`../../botconfig/config.json`);
const ee = require(`../../botconfig/embed.json`);
const emoji = require(`../../botconfig/emojis.json`);
module.exports = {
  name: `bassboost`,
  category: `👀 Filter`,
  aliases: [`bb`],
  description: `Changes the Bass gain`,
  usage: `bassboost <none/low/medium/high>`,
  parameters: {"type":"music", "activeplayer": true, "previoussong": false},
  run: async (client, message, args, cmduser, text, prefix, player) => {
    try {
      let level = `none`;
      if (!args.length || (!client.bassboost[args[0].toLowerCase()] && args[0].toLowerCase() != `none`))
        return message.channel.send(new MessageEmbed()
          .setColor(ee.wrongcolor)
          .setTitle(`${emoji.msg.ERROR} | ระดับการเพิ่มเสียงเบสต้องเป็นหนึ่งในสิ่งต่อไปนี้: \`none\`, \`low\`, \`medium\`, \`high\`, \`earrape\``)
        );
      level = args[0].toLowerCase();
      switch (level) {
        case `none`:
          player.setEQ(client.bassboost.none);
          break;
        case `low`:
          player.setEQ(client.bassboost.low);
          break;
        case `medium`:
          player.setEQ(client.bassboost.medium);
          break;
        case `high`:
          player.setEQ(client.bassboost.high);
        case `earrape`:
          player.setEQ(client.bassboost.high);
          break;
          case `nightcore`:
            player.setEQ(client.bassboost.nightcore);
            break;
      }
      return message.channel.send(new MessageEmbed()
        .setColor(ee.color)
        .setFooter(ee.footertext, ee.footericon)
        .setTitle(`${emoji.msg.SUCCESS} | Bassboost ตั้งค่าเป็น \`${level}\``)
        .setDescription(`Note: *อาจใช้เวลาถึง 5 วินาทีจนกว่าคุณจะได้ยิน Equalizer ใหม่*`)
      );
    } catch (e) {
      console.log(String(e.stack).bgRed)
      return message.channel.send(new MessageEmbed()
        .setColor(ee.wrongcolor)
        .setFooter(ee.footertext, ee.footericon)
        .setTitle(`${emoji.msg.ERROR} | เกิดข้อผิดพลาด`)
        .setDescription(`\`\`\`${e.message}\`\`\``)
      );
    }
  }
};
