
const config = require("../../botconfig/config.json"); //loading config file with token and prefix, and settings
const ee = require("../../botconfig/embed.json"); //Loading all embed settings like color footertext and icon ...
const emoji = require(`../../botconfig/emojis.json`);
const Discord = require("discord.js"); //this is the official discord.js wrapper for the Discord Api, which we use!
const { createBar, format, databasing, escapeRegex, isrequestchannel, getRandomInt, delay} = require("../../handlers/functions"); //Loading all needed functions
const requestcmd = require("../../handlers/requestcmds");
const db = require('quick.db');
const {
  MessageEmbed
} = require(`discord.js`);
//here the event starts
module.exports = async (client, message) => {
	const { DiscordTogether } = require('discord-together');
    client.blacklist = [];
	if(db.get('blacklist.list')) client.blacklist = db.get('blacklist.list');
client.discordTogether = new DiscordTogether(client);
    //if the message is not in a guild (aka in dms), return aka ignore the inputs
    if (!message.guild || !message.channel) return;
    //if the channel is on partial fetch it
    if (message.channel.partial) await message.channel.fetch();
    //if the message is on partial fetch it
    if (message.partial) await message.fetch();
    //ensure all databases for this server/user from the databasing function
    databasing(client, message.guild.id, message.author.id)
    //get the setup channel from the database and if its in there sent then do this
    var irc = await isrequestchannel(client, message.channel.id, message.guild.id);
    if(irc) return requestcmd(client, message); //requestcommands
    // if the message  author is a bot, return aka ignore the inputs
    if (message.author.bot) return;
    //get the current prefix from the database
    let prefix = client.settings.get(message.guild.id, "prefix");
    //if not in the database for some reason use the default prefix
    if (prefix === null) prefix = config.prefix;
    //the prefix can be a Mention of the Bot / The defined Prefix of the Bot
    const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(prefix)})\\s*`);
    //if its not that then return
    if (!prefixRegex.test(message.content)) return;
    //now define the right prefix either ping or not ping
    const [, matchedPrefix] = message.content.match(prefixRegex);
    //if(client.blacklist.includes(message.author.id)) return message.channel.send(new Discord.MessageEmbed()
	// .setTitle('ขอโทษนะนายโดนระงับการใช้บอทนี้ขอโทษทีนะถ้าอยากโดนปลดต้องทักไปหาผู้พัฒนา ยูทูปYoMax #0001')
  //   .setColor("RED"));
    let not_allowed = false;
    //CHECK IF IN A BOT CHANNEL OR NOT
    if(client.settings.get(message.guild.id, `botchannel`).toString() !== ""){
        //if its not in a BotChannel, and user not an ADMINISTRATOR
        if (!client.settings.get(message.guild.id, `botchannel`).includes(message.channel.id) && !message.member.hasPermission("ADMINISTRATOR")) {
          //create the info string
            let leftb = "";
            for(let i = 0; i < client.settings.get(message.guild.id, `botchannel`).length; i++){
                leftb  +="<#" +client.settings.get(message.guild.id, `botchannel`)[i] + "> / "
            }
            //send informational message
            try{ message.react("❌").catch(e => console.log("couldn't react this is a catch to prevent a crash".grey)); }catch{}
            not_allowed = true;
            return message.channel.send(new Discord.MessageEmbed()
              .setColor(ee.wrongcolor)
              .setFooter(ee.footertext, ee.footericon)
              .setTitle(`❌ Error | Not in the Bot Chat!`)
              .setDescription(`There is a Bot chat setup in this GUILD! try using the Bot Commands here:\n> ${leftb.substr(0, leftb.length - 3)}`)
            ).then(msg => {
              try{
               msg.delete({timeout: 5000}).catch(e=>console.log("couldn't delete message this is a catch to prevent a crash".grey));
              }catch{ /* */ }
            });
        }
    }
	
    if(!message.content.startsWith(prefix)) {
    if (message.content.match(new RegExp(`<@!${client.user.id}>`,'i'))) {
    message.reply(new Discord.MessageEmbed()
    .setAuthor('ZELEN', client.user.avatarURL())
    .setDescription(`คำนำหน้าของฉันคือ ${prefix} ดูคำสั่งทั้งหมด ${prefix}help `)
    .setColor('BLUE'))
      }
    }
	
    //create the arguments with sliceing of of the rightprefix length
    const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
    //creating the cmd argument by shifting the args by 1
    const cmd = args.shift().toLowerCase();
    //if no cmd added return error
    if (cmd.length === 0){
      not_allowed = true;
      if(matchedPrefix.includes(client.user.id))
      return;
      }
    //get the command from the collection
    let command = client.commands.get(cmd);
    //if the command does not exist, try to get it by his alias
    if (!command) command = client.commands.get(client.aliases.get(cmd));
    //if the command is now valid
    if (command){
        if (!client.cooldowns.has(command.name)) { //if its not in the cooldown, set it too there
            client.cooldowns.set(command.name, new Discord.Collection());
        }
        const now = Date.now(); //get the current time
        const timestamps = client.cooldowns.get(command.name); //get the timestamp of the last used commands
        const cooldownAmount = (command.cooldown || 2.5) * 1000; //get the cooldownamount of the command, if there is no cooldown there will be automatically 1 sec cooldown, so you cannot spam it^^
        if (timestamps.has(message.author.id)) { //if the user is on cooldown
          const expirationTime = timestamps.get(message.author.id) + cooldownAmount; //get the amount of time he needs to wait until he can run the cmd again
          if (now < expirationTime) { //if he is still on cooldonw
            const timeLeft = (expirationTime - now) / 1000; //get the lefttime
            try{ message.react("❌").catch(e => console.log("couldn't react this is a catch to prevent a crash".grey)); }catch{}
            not_allowed = true;
            return message.channel.send(new Discord.MessageEmbed()
              .setColor('RED')
              //.setFooter(ee.footertext,ee.footericon)
              .setTitle(`❌ โปรดรอ ${timeLeft.toFixed(1)}วิ ก่อนที่จะใช้คำสั่ง \`${command.name}\``)
              //.addField("Why a delay?", "Because that's the only way how I can prevent you from abusing(spamming) me!")
            ); //send an information message
          }
        }
        timestamps.set(message.author.id, now); //if he is not on cooldown, set it to the cooldown
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount); //set a timeout function with the cooldown, so it gets deleted later on again
      try{
        client.stats.inc(message.guild.id, "commands"); //counting our Database stats for SERVER
        client.stats.inc("global", "commands"); //counting our Database Stats for GLOBAL
        //if Command has specific permission return error
        if(command.memberpermissions) {
          if (!message.member.hasPermission(command.memberpermissions)) {
            try{ message.react("❌").catch(e => console.log("couldn't react this is a catch to prevent a crash".grey)); }catch{}
            not_allowed = true;
            message.channel.send(new Discord.MessageEmbed()
              .setColor(ee.wrongcolor)
              .setFooter(ee.footertext, ee.footericon)
              .setTitle("❌ ผิดพลาด | คุณไม่ได้รับอนุญาตให้เรียกใช้คำสั่งนี้!")
              .setDescription(`คุณต้องการสิทธิ์เหล่านี้: \`${command.memberpermissions.join("`, ``")}\``)
            ).then(msg => {
              try{
                 msg.delete({timeout: 5000}).catch(e=>console.log("couldn't delete message this is a catch to prevent a crash".grey));
              }catch{ /* */ }
            });
            }
          }
        //if Command has specific permission return error

        if(client.settings.get(message.guild.id, `djonlycmds`) && client.settings.get(message.guild.id, `djonlycmds`).join(" ").toLowerCase().split(" ").includes(command.name.toLowerCase())) {
          //Check if there is a Dj Setup
          if(client.settings.get(message.guild.id, `djroles`).toString()!==""){
            const player = client.manager.players.get(message.guild.id);
            //create the string of all djs and if he is a dj then set it to true
            let isdj=false;
            let leftb = "";
              if(client.settings.get(message.guild.id, `djroles`).join("") === "")
                  leftb = "no Dj Roles, aka all Users are Djs"
              else
                for(let i = 0; i < client.settings.get(message.guild.id, `djroles`).length; i++){
                  if(message.member.roles.cache.has(client.settings.get(message.guild.id, `djroles`)[i])) isdj = true;
                    if(!message.guild.roles.cache.get(client.settings.get(message.guild.id, `djroles`)[i])) continue;
                      leftb += "<@&" + client.settings.get(message.guild.id, `djroles`)[i] + "> | "
                }
              //if not a DJ and not a nAdmin

              if(!isdj && !message.member.hasPermission("ADMINISTRATOR")) {
                if(player && player.queue.current.requester.id !== message.author.id) {
                  try{ message.react("❌").catch(e => console.log("couldn't react this is a catch to prevent a crash".grey)); }catch{}
                  not_allowed = true;
                   return message.channel.send(new Discord.MessageEmbed()
                    .setColor(ee.wrongcolor)
                    .setTitle("❌ | คุณไม่ได้รับอนุญาตให้เรียกใช้คำสั่งนี้ที่นี่!")
                    .setDescription(`You need to have one of those Roles:\n${leftb.substr(0, leftb.length-3)}\n\nOr be the Requester (${player.queue.current.requester}) of the current Track!`)
                  ).then(msg => {
                    try{
                       msg.delete({timeout: 5000}).catch(e=>console.log("couldn't delete message this is a catch to prevent a crash".grey));
                    }catch{ /* */ }
                  });
                }
              }
            }
        }
        //if there is a SETUP with an EXISTING text channel                             and its a   MUSIC  or FILTER COMMAND                              AND NOT in the                         RIGHT CHANNEL return error msg        and if its request only enabled
        if(message.guild.channels.cache.get(client.setups.get(message.guild.id, "textchannel")) &&
          (command.category.toLowerCase().includes("music") || command.category.toLowerCase().includes("filter")) &&
           client.setups.get(message.guild.id, "textchannel") !== message.channel.id &&
           client.settings.get(message.guild.id, `requestonly`)){
             try{ message.react("❌").catch(e => console.log("couldn't react this is a catch to prevent a crash".grey)); }catch{}
             not_allowed = true;
              return message.channel.send(new Discord.MessageEmbed()
              .setColor(ee.wrongcolor)
			  .setDescription(`หากต้องการเปิดเพลงให้พิมชื่อหรือลิ้งใน ${message.guild.channels.cache.get(client.setups.get(message.guild.id, "textchannel"))} นะครับ`)
            )

        }

        if(command.category.toLowerCase().includes("admin") ||command.category.toLowerCase().includes("settings") || command.category.toLowerCase().includes("owner")) {
          let required_perms = ["KICK_MEMBERS","BAN_MEMBERS","MANAGE_CHANNELS","ADD_REACTIONS","VIEW_CHANNEL","SEND_MESSAGES","MANAGE_MESSAGES"
          ,"EMBED_LINKS", "ATTACH_FILES","CONNECT","SPEAK", "MANAGE_ROLES"]
          if(!message.guild.me.hasPermission(required_perms)){
            try{ message.react("❌").catch(e => console.log("couldn't react this is a catch to prevent a crash".grey)); }catch{}
            not_allowed = true;
            return message.channel.send(new Discord.MessageEmbed()
              .setColor(ee.wrongcolor)
              .setFooter(ee.footertext, ee.footericon)
              .setTitle("❌ ผิดพลาด | ฉันไม่มีสิทธิ์เพียงพอ!")
              .setDescription("โปรดให้แค่ 'ผู้ดูแลระบบ' เพราะฉันต้องการลบข้อความ สร้างช่อง และดำเนินการคำสั่งของผู้ดูแลระบบทั้งหมด\n หากคุณไม่ต้องการให้ฉัน สิทธิ์เหล่านั้นคือสิทธิ์ที่ฉันต้องการ: \n> `" + required_perms.join("`, `") +"`")
            )
          }
        }

        const player = client.manager.players.get(message.guild.id);
        
        if(command.parameters) {
          if(command.parameters.type == "music"){
             //get the channel instance
            const { channel } = message.member.voice;
            const mechannel = message.guild.me.voice.channel;
            //if not in a voice Channel return error
            if (!channel) {
              not_allowed = true;
              return message.channel.send(new MessageEmbed()
                .setColor(ee.wrongcolor)
                .setTitle(`${emoji.msg.ERROR} | คุณต้องเข้าร่วมช่องเสียง`)
              );
            }
            //If there is no player, then kick the bot out of the channel, if connected to
            if(!player && mechannel) {
              message.guild.me.voice.kick().catch(e=>console.log("This prevents a Bug"));
            }
            //if no player available return error | aka not playing anything
            if(command.parameters.activeplayer){
              if (!player){
                not_allowed = true;
                return message.channel.send(new MessageEmbed()
                  .setColor(ee.wrongcolor)
                  .setTitle(`${emoji.msg.ERROR} | ไม่มีอะไรเล่น`)
                );
              }
              if (!mechannel){
                if(player) try{ player.destroy() }catch{ }
                not_allowed = true;
                return message.channel.send(new MessageEmbed()
                  .setColor(ee.wrongcolor)
                  .setTitle(`${emoji.msg.ERROR} | ฉันไม่ได้เชื่อมต่อกับช่อง`)
                );
              }
            }
            //if no previoussong
            if(command.parameters.previoussong){
              if (!player.queue.previous || player.queue.previous === null){
                not_allowed = true;
                return message.channel.send(new MessageEmbed()
                  .setColor(ee.wrongcolor)
                  .setTitle(`${emoji.msg.ERROR} | ยังไม่มีเพลงก่อนหน้า!`)
                );
              }
            }
            //if not in the same channel --> return
            if (player && channel.id !== player.voiceChannel && !command.parameters.notsamechannel)
              return message.channel.send(new MessageEmbed()
                .setColor(ee.wrongcolor)
                .setTitle(`${emoji.msg.ERROR} | You need to be in my voice channel to use this command!`)
                .setDescription(`Channelname: \`🔈 ${message.guild.channels.cache.get(player.voiceChannel).name}\``)
              );
            //if not in the same channel --> return
            if (mechannel && channel.id !== mechannel.id && !command.parameters.notsamechannel)
            return message.channel.send(new MessageEmbed()
              .setColor(ee.wrongcolor)
              .setTitle(`${emoji.msg.ERROR} | You need to be in my voice channel to use this command!`)
              .setDescription(`Channelname: \`🔈 ${mechannel.name}\``)
            );
          }
        }
        //run the command with the parameters:  client, message, args, user, text, prefix,
        if(not_allowed) return;
        command.run(client, message, args, message.member, args.join(" "), prefix, player);
      }catch (e) {
        console.log(String(e.stack).red)
        return message.channel.send(new Discord.MessageEmbed()
          .setColor(ee.wrongcolor)
          .setFooter(ee.footertext, ee.footericon)
          .setTitle("❌ Something went wrong while, running the: `" + command.name + "` command")
          .setDescription(`\`\`\`${e.message}\`\`\``)
        ).then(msg => {
          try{
             msg.delete({timeout: 5000}).catch(e=>console.log("couldn't delete message this is a catch to prevent a crash".grey))
          }catch{ /* */ }
        });
      }
    }
  }