const {
  MessageEmbed
} = require("discord.js");
const config = require("../../botconfig/config.json");
const ee = require("../../botconfig/embed.json");
const emoji = require("../../botconfig/emojis.json");

module.exports = {
  name: "setup",
  category: "⚙️ Settings",
  aliases: ["musicsetup"],
  cooldown: 10,
  usage: "setup",
  description: "Creates an unique Music Setup for Requesting Songs!",
  memberpermissions: [`ADMINISTRATOR`],
  run: async (client, message, args, cmduser, text, prefix) => {
    try {
      let musiccmds = [];
      const commands = (category) => {
        return client.commands.filter((cmd) => cmd.category.toLowerCase().includes("music")).map((cmd) => `\`${cmd.name}\``);
      };
      for (let i = 0; i < client.categories.length; i += 1) {
        if (client.categories[i].toLowerCase().includes("music")) {
          musiccmds = commands(client.categories[i]);
        }
      }
      //get the old setup
      let oldsetup = client.setups.get(message.guild.id);
      //try to delete every single entry if there is a setup
	  const channel  = message.guild.channels.cache.get(oldsetup.textchannel)
      if (channel) return message.reply('คุณมีห้องที่ใช้เปิดเพลงอยู่แล้ว <#'+oldsetup.textchannel+'>');
            //set the maximumbitrate limit
            let maxbitrate = 96000;
            //get the boosts amount
            let boosts = message.guild.premiumSubscriptionCount;
            //change the bitrate limit regarding too boost level from https://support.discord.com/hc/de/articles/360028038352-Server-Boosting-
            if (boosts >= 2) maxbitrate = 128000;
            if (boosts >= 15) maxbitrate = 256000;
            if (boosts >= 30) maxbitrate = 384000;

                  message.guild.channels.create(`【🎵】𝐙𝐞𝐥𝐞𝐧-𝐌𝐮𝐬𝐢𝐜`, {
                      type: 'text', // text channel
                      rateLimitPerUser: 6, //set chat delay
                      permissionOverwrites: [{
                          id: message.guild.id,
                          allow: ['VIEW_CHANNEL', "SEND_MESSAGES", "ADD_REACTIONS"],
                        },
                        { //giving the Bot himself permissions
                          id: client.user.id,
                          allow: ["MANAGE_MESSAGES", "MANAGE_CHANNELS", "ADD_REACTIONS", "SEND_MESSAGES", "MANAGE_ROLES"]
                        }
                      ],
                    })
                    .then(async (channel3) => {
                      message.reply(`ตั้งค่าใน <#${channel3.id}>`)
                      let embed2 = new MessageEmbed()
                        .setColor(ee.color)
                        .setTitle(`เข้าร่วมห้องพูดคุย และพิมพ์ชื่อเพลงหรือลิงก์ของเพลง เพื่อเปิดเพลง.`)
                      let embed3 = new MessageEmbed()
                        .setColor(ee.color)
                        .setTitle("ไม่มีเพลงที่กำลังเล่นในขณะนี้!")
                        .setDescription(`เข้าร่วมห้องพูดคุย และพิมพ์ชื่อเพลงหรือลิงก์ของเพลง เพื่อเปิดเพลง.`)
                        .setImage("https://cdn.discordapp.com/attachments/850698946681634835/918717999798681600/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f776174747061642d6d656469612d736572766963652f53746f.gif")
	
                        channel3.send(new MessageEmbed().setColor(ee.color).setDescription("Setting Up..")).then(msg => {
                          //edit the message again
                          msg.edit(embed2)
                          //save it in the database
                          client.setups.set(message.guild.id, msg.id, "message_queue_info");
                          //send an message again
                          channel3.send(new MessageEmbed().setColor(ee.color).setDescription("Setting Up..")).then(async msg => {
                            //edit the message
                            msg.edit(embed3)
                            //react with all reactions
                            await msg.react(emoji.react.pause_resume) //pause / resume
                            await msg.react(emoji.react.stop) //stop playing music
                            await msg.react(emoji.react.skip_track) //skip track / stop playing
                            await msg.react(emoji.react.replay_track) //replay track
                            await msg.react(emoji.react.reduce_volume) //reduce volume by 10%
                            await msg.react(emoji.react.raise_volume) //raise volume by 10%
                            await msg.react(emoji.react.toggle_mute) //toggle mute
                            await msg.react(emoji.react.repeat_mode) //change repeat mode --> track --> Queue --> none
                            await msg.react(emoji.react.shuffle) //shuffle the Queue
                            //create the collector
                            //save all other datas in the database
                            client.setups.set(message.guild.id, msg.id, "message_track_info");
                            client.setups.set(message.guild.id, channel3.id, "textchannel");
                            client.stats.inc("global", "setups");
                          });
                        })
                    })
                 

    } catch (e) {
      console.log(String(e.stack).bgRed)
      return message.channel.send(new MessageEmbed()
        .setColor(ee.wrongcolor)
        .setFooter(ee.footertext, ee.footericon)
        .setTitle(`${emoji.msg.ERROR} | อะไรบางอย่างผิดปกติ`)
        .setDescription(`\`\`\`${e.message}\`\`\``)
      );
    }
  },
};
