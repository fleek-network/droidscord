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

const queryAlgolia = async (query: string) => {
  const response = await index.search(query);

  console.log('[debug] response', response);

  const msg = 'Ok! That was a good message!';

  return msg;
}

type ResponseDocsBotFetch = {
  answer: string,
  sources: {
    type: string,
    title: string,
    url: string,
    page: string,
    content: string,
  },
  id: string,
};

const queryDocsBotApi = async (query: string) => {
  const botId = 'kfyP76122ztON4Prkdsf';
  const teamId = 'IzEH9RyK34tl3vAR6Rst';
  const url = `https://api.docsbot.ai/teams/${teamId}/bots/${botId}/ask`;

  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  
  var raw = JSON.stringify({
    "question": query,
    "full_source": false
  });
  
  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };
  
  try {
    const response = await fetch(
      url,
      requestOptions as RequestInit
    );
    
    const data: ResponseDocsBotFetch = await response.json();

    return data?.answer;
  } catch (err) {
    console.error(err);
  }
}

client.on('ready', () => {
  console.log('🤖 The Bot is online!');
});

client.on('messageCreate', async (msg) => {
  if (msg.author.bot) return;

  try {
    await msg.channel.sendTyping();

    const replyMsg = await queryDocsBotApi(msg.content);

    if (!replyMsg) {
      console.warn(`No answers for "${msg.content}"`);

      return;
    }

    // Discord has a message limit of 2000 char
    msg.reply(replyMsg);
  } catch (err) {
    console.error(err);
  }
});

client.login(process.env.TOKEN);
