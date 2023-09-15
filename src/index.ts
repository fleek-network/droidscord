import * as dotenv from 'dotenv'
import { Client, IntentsBitField } from 'discord.js';
import algoliasearch from 'algoliasearch';

dotenv.config();

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildMessageTyping,
    IntentsBitField.Flags.GuildMembers,
  ],
});

// Connect and authenticate with your Algolia app
const alogliaClient = algoliasearch(
  process.env.ALGOLIA_APP_ID as string,
  process.env.ALGOLIA_SEARCH_API as string
);

const index = alogliaClient.initIndex(process.env.ALGOLIA_INDEX as string);

const queryAlgolia = async (query: string) => {
  const response = await index.search(query);

  console.log('[debug] response', response);

  const msg = 'Ok! That was a good message!';

  return msg;
}

client.on("ready", () => {
  if (client.user) {
    console.log(`Logged in as ${client.user.tag}!`)
  }
  
  console.log('🤖 The Bot is online!');
})

client.on("messageCreate", async (msg) => {
  if (msg.content === "!ping") {
    const data = await queryAlgolia("test");

    console.log(data);

    msg.reply("pong");
  }
})

client.login(process.env.DISCORD_BOT_TOKEN);