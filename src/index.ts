import * as dotenv from 'dotenv'
import {
  Client,
  IntentsBitField,
  Message,
  User,
  GuildTextBasedChannel,
} from 'discord.js';
import dayjs from 'dayjs';

dotenv.config();

// Const
const MSG_WHITELIST_NOT_REQUIRED='👋 Hey! Since the Testnet Phase {1}, everyone was free to set up and run a node! There hasn\'t been whitelisting since and until further notice, you shouldn\'t be worried. Read our https://blog.fleek.network and check our documentation https://docs.fleek.network to learn more, please 🙏';

const deleteMsg = async ({
  msg,
}: {
  msg: Message,
}) => {
  try {
    await msg?.delete();
  } catch (err) {
    console.error(`Oops! Failed to delete ${msg?.id}`)
  }
}

const sendMsgToUser = async ({
 user,
 message,
}: {
  user: User,
  message: string,
}) => {
  try {
    if (user.id) {
      const res = await user.send(message);

      if (!res) return false;
    }
  } catch (err) {
    console.error('Oops! Failed to send a DM to user');

    return false;
  }

  return true;
}

const sendMsgToChannel = async ({
  channel,
  user,
  message,
}: {
  channel: GuildTextBasedChannel,
  user: User,
  message: string,
}) => {
  try {
    await channel.send(message);
  } catch (err) {
    console.error('Oops! Failed to send message to channel');
  }
}

let lastWhiteListMsg = dayjs();
let warningMsg: Message[] = [];

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildMessageTyping,
    IntentsBitField.Flags.GuildMembers,
  ],
});

client.on("ready", () => {
  if (client.user) {
    console.log(`Logged in as ${client.user.tag}!`)
  }
  
  console.log('🤖 The Bot is online!');
});

client.on("messageCreate", async (msg) => {
  if (msg.content.includes('whitelist')) {
    const currentWhiteListMsg = dayjs();
    const diffInMins = currentWhiteListMsg.diff(lastWhiteListMsg, 'minute');    

    console.log('[debug] diffInMins ', diffInMins);

    if (diffInMins > parseFloat(process.env.WHITELIST_MSG_TIMEOUT_MINUTES as string)) {
      msg.channel.send(MSG_WHITELIST_NOT_REQUIRED);
      lastWhiteListMsg = currentWhiteListMsg;
    }
  }

  if (msg.content.toLowerCase() === 'gm') {
    if (! msg.inGuild()) return;

    if (warningMsg.length) {
      try { 
        const res = await msg.channel.bulkDelete(warningMsg);
        console.warn(`Deleted ${res.size} messages!`);
      } catch (err) {
        console.error('Oops! Failed to delete some messages');
      }
    }

    await deleteMsg({
      msg,
    });

    const { author: user, channel } = msg;
    const message = `${msg.author.toString()} for greetings use the channel <#${process.env.DISCORD_CHANNEL_ID_GM_GN}>`;

    const hasSentMsg = await sendMsgToUser({
      user,
      message,
    });

    if (!hasSentMsg) {
      await sendMsgToChannel({
        channel,
        message,
        user,
      });
    }
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);