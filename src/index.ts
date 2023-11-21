import * as dotenv from "dotenv";
import algoliasearch from "algoliasearch";
import {
  Client,
  IntentsBitField,
  Message,
  User,
  GuildTextBasedChannel,
  TextChannel,
} from "discord.js";
import dayjs from "dayjs";
import axios from "axios";

dotenv.config();

type AlgoliaHitHierarchy = {
  lvl0: string | null;
  lvl1: string | null;
  lvl2: string | null;
  lvl3: string | null;
  lvl4: string | null;
  lvl5: string | null;
  lvl6: string | null;
};

type AlgoliaHit = {
  anchor: string;
  content: string | null;
  hierarchy: AlgoliaHitHierarchy;
  objectID: string;
  url: string;
};

enum Docs {
  Site = "https://docs.fleek.network",
}

// Const
const PREFIX = "!";
const MSG_WHITELIST_NOT_REQUIRED =
  "👋 Hey! Since the Testnet Phase {1}, that all users are free to set up and run a node. There hasn't been any whitelisting since and until further notice, you shouldn't be worried. Read our https://blog.fleek.network and check our documentation https://docs.fleek.network to learn more, please 🙏";

const deleteMsg = async ({ msg }: { msg: Message }) => {
  try {
    await msg?.delete();
  } catch (err) {
    console.error(`Oops! Failed to delete ${msg?.id}`);
  }
};

const sendMsgToUser = async ({
  user,
  message,
}: {
  user: User;
  message: string;
}) => {
  try {
    if (user.id) {
      const res = await user.send(message);

      if (!res) return false;
    }
  } catch (err) {
    console.error("Oops! Failed to send a DM to user");

    return false;
  }

  return true;
};

const sendMsgToChannel = async ({
  channel,
  message,
}: {
  channel: GuildTextBasedChannel;
  message: string;
}) => {
  try {
    await channel.send(message);
  } catch (err) {
    console.error("Oops! Failed to send message to channel");
  }
};

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

const algoliaClient = algoliasearch(
  process.env.ALGOLIA_APP_ID as string,
  process.env.ALGOLIA_SEARCH_API as string,
);

const algoliaIndex = algoliaClient.initIndex(
  process.env.ALGOLIA_INDEX as string,
);

client.on("ready", () => {
  if (client.user) {
    console.log(`Logged in as ${client.user.tag}!`);
  }

  console.log("🤖 The Bot is online!");
});

client.on("messageCreate", async (msg) => {
  if (msg.content.includes("whitelist")) {
    const currentWhiteListMsg = dayjs();
    const diffInMins = currentWhiteListMsg.diff(lastWhiteListMsg, "minute");

    if (
      diffInMins >
      parseFloat(process.env.WHITELIST_MSG_TIMEOUT_MINUTES as string)
    ) {
      msg.channel.send(MSG_WHITELIST_NOT_REQUIRED);
      lastWhiteListMsg = currentWhiteListMsg;
    }
  }

  if (
    ["gm", "gn"].some((greeting) =>
      msg.content.toLowerCase().includes(greeting),
    )
  ) {
    if (!msg.inGuild() || !msg.channel.isTextBased()) return;

    if (warningMsg.length) {
      try {
        const res = await (msg.channel as TextChannel).bulkDelete(warningMsg);
        console.warn(`Deleted ${res.size} messages!`);
      } catch (err) {
        console.error("Oops! Failed to delete some messages");
      }
    }

    await deleteMsg({
      msg,
    });

    const { author: user, channel } = msg;
    const message = `${msg.author.toString()} for greetings use the channel <#${
      process.env.DISCORD_CHANNEL_ID_GM_GN
    }>`;

    const hasSentMsg = await sendMsgToUser({
      user,
      message,
    });

    if (!hasSentMsg) {
      await sendMsgToChannel({
        channel: channel as TextChannel,
        message,
      });
    }
  }

  if (msg.content.startsWith(`${PREFIX}docs`)) {
    if (msg.content === `${PREFIX}docs`) {
      msg.channel.send(`Visit the documentation site at ${Docs.Site}`);

      return;
    }

    const re = /^!docs\s(<@\d+>)$/g;
    const match = msg.content.matchAll(re);

    if (match) {
      try {
        const user = [...match][0][1];

        msg.channel.send(
          `👋 Hey ${user}, visit the documentation site at ${Docs.Site}`,
        );
      } catch (err) {
        console.error(`Oops! Failed to send docs site url to user`);
      }
    }
  }

  if (msg.content.startsWith(`${PREFIX}search`)) {
    const query = msg.content.split(`${PREFIX}search`)[1];

    if (!query) return;

    const { hits } = await algoliaIndex.search<AlgoliaHit>(query);

    const urls = hits
      .map((data) => {
        if (data.url === undefined) return;

        return data?.url && `<${data.url}>`;
      })
      .filter((url) => url && !url.includes("/tags"));

    if (!urls.length) return;

    const answer = urls.join("\n");
    msg.channel.send(`👋 Hey! Found the following results:\n\n ${answer}`);
  }

  if (msg.content.startsWith(`${PREFIX}ask`)) {
    const query = msg.content.split(`${PREFIX}ask`)[1];

    msg.channel.send(
      `👀 ${msg.author.toString()} received the query "${query}", please be patient while I check..`,
    );

    try {
      const res = await axios.get(
        `http://localhost:8000/query?question=${query}`,
      );

      msg.channel.send(`👋 ${msg.author.toString()} ${res.data.answer}`);
    } catch (err) {
      console.error(err);

      msg.channel.send(
        `${msg.author.toString()} Oops! Failed to get an answer for some reason...`,
      );
    }
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
