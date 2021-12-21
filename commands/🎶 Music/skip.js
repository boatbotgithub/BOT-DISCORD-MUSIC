const { MessageEmbed } = require("discord.js");
const config = require("../../botconfig/config.json");
const ee = require("../../botconfig/embed.json");
const { autoplay, isrequestchannel, edit_request_message_track_info } = require("../../handlers/functions");
module.exports = {
    name: "forceskip",
    category: "🎶 Music",
    aliases: ["s"],
    description: "Forces to skip the current song",
    usage: "forceskip",
    run: async (client, message, args, cmduser, text, prefix) => {
    try{
      //get the channel instance from the Member
      const { channel } = message.member.voice;
      //if the member is not in a channel, return
      if (!channel)
        return message.channel.send(new MessageEmbed()
          .setColor(ee.wrongcolor)
          .setFooter(ee.footertext, ee.footericon)
          .setTitle("❌ ผิดพลาด | คุณต้องเข้าร่วมช่องเสียง")
        );
      //get the player instance
      const player = client.manager.players.get(message.guild.id);
      //if no player available return error | aka not playing anything
      if (!player){
        if(message.guild.me.voice.channel) {
          message.guild.me.voice.channel.leave().catch(e => console.log(e))
            return message.channel.send(new MessageEmbed()
              .setTitle(`${emoji.msg.SUCCESS} | หยุดและออกจากช่องของคุณ`)
              .setColor(ee.color)
              .setFooter(ee.footertext, ee.footericon)
            );
        }
        else {
          return message.channel.send(new MessageEmbed()
            .setFooter(ee.footertext, ee.footericon)
            .setColor(ee.wrongcolor)
            .setTitle(`${emoji.msg.ERROR} | ไม่มีเพลงกำลังเล่นอยู่ในกิลด์นี้.`)
          );
        }
        return
      }
      
     
      //if not in the same channel as the player, return Error
      if (channel.id !== player.voiceChannel)
        return message.channel.send(new MessageEmbed()
          .setFooter(ee.footertext, ee.footericon)
          .setColor(ee.wrongcolor)
          .setTitle("❌ ผิดพลาด | คุณต้องอยู่ในช่องเสียงของฉันเพื่อใช้คำสั่งนี้!")
          .setDescription(`Channelname: \`${message.guild.channels.cache.get(player.voiceChannel).name}\``)
        );
      //if ther is nothing more to skip then stop music and leave the Channel
      if (player.queue.size == 0) {
        //if its on autoplay mode, then do autoplay before leaving...
        if(player.get("autoplay")) return autoplay(client, player, "skip");
        var irc = await isrequestchannel(client, player.textChannel, player.guild);
        if(irc) {
          return edit_request_message_track_info(client, player, player.queue.current, "destroy");
        }
        if(message.guild.me.voice.channel) {
          message.guild.me.voice.channel.leave().catch(e => console.log(e))
          player.destroy().catch(e => console.log(e))
            return message.channel.send(new MessageEmbed()
              .setTitle(`${emoji.msg.SUCCESS} | หยุดและออกจากช่องของคุณ`)
              .setColor(ee.color)
              .setFooter(ee.footertext, ee.footericon)
            );
        }
        else {
          player.destroy().catch(e => console.log(e))
          return message.channel.send(new MessageEmbed()
            .setTitle(`${emoji.msg.SUCCESS} | หยุดและออกจากช่องของคุณ`)
            .setColor(ee.color)
            .setFooter(ee.footertext, ee.footericon)
          );
        }
        return
      }
      //skip the track
      player.stop();
      //send success message
      return message.channel.send(new MessageEmbed()
        .setTitle("✅สำเร็จ ข้ามไปยังเพลงถัดไป")
        .setColor(ee.color)
        .setFooter(ee.footertext, ee.footericon)
      );
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return message.channel.send(new MessageEmbed()
            .setColor(ee.wrongcolor)
			.setFooter(ee.footertext, ee.footericon)
            .setTitle(`❌ | เกิดข้อผิดพลาด`)
            .setDescription(`\`\`\`${e.message}\`\`\``)
        );
    }
  }
};
