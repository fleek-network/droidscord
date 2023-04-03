import * as dotenv from 'dotenv'
import { Client, IntentsBitField } from 'discord.js';
import algoliasearch from 'algoliasearch';

dotenv.config();

// Connect and authenticate with your Algolia app
const alogliaClient = algoliasearch(
  process.env.ALGOLIA_APP_ID as string,
  process.env.ALGOLIA_SEARCH_API as string
);

const index = alogliaClient.initIndex(process.env.ALGOLIA_INDEX as string);

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

client.on('ready', () => {
  console.log('🤖 The Bot is online!');
});

client.on('messageCreate', async (msg) => {
  if (msg.author.bot) return;

  try {
    await msg.channel.sendTyping();

    const response = await index.search('rewards');

    console.log('[debug] response', response);

    // Discord has a message limit of 2000 char
    msg.reply('Ok! That was a good message!');
  } catch (err) {
    console.error(err);
  }
});

client.login(process.env.TOKEN);
