import * as dotenv from 'dotenv'
import { Client, IntentsBitField } from 'discord.js';

dotenv.config();

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

client.on('ready', () => {
  console.log('🤖 Bot is online!');
});

client.on('messageCreate', async (msg) => {
  if (msg.author.bot) return;

  try {
    await msg.channel.sendTyping();

    // Discord has a message limit of 2000 char
    msg.reply('Ok! That was a good message');
  } catch (err) {
    console.error(err);
  }
});

client.login(process.env.TOKEN);
