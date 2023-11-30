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
import Queue from "bee-queue";
import mongoose from "mongoose";

dotenv.config();

type Job = {
  data: {
    query: string;
    channelId: string;
    user: User;
  };
};

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

const sharedConfig = {
  isWorker: true,
  removeOnSuccess: true,
  redis: {
    host: process.env.REDIS_HOSTNAME,
  },
};
const llmQueue = new Queue("LLM_QUERY", sharedConfig);

// Const
const whitelistChannelIds = (() => {
  if (!process.env.WHITELIST_CHANNEL_IDS) {
    throw new Error("Oops! The WHITELIST_CHANNEL_IDS env var is not set");
  }

  const data = process.env.WHITELIST_CHANNEL_IDS.split(",");

  if (!data.length) {
    throw new Error("Oops! Empty WHITELIST_CHANNEL_IDS env var");
  }

  return [...data];
})();
const PREFIX = "!";
const MSG_WHITELIST_NOT_REQUIRED =
  "👋 Hey! Since the Testnet Phase {1}, that all users are free to set up and run a node. There hasn't been any whitelisting since and until further notice, you shouldn't be worried. Read our https://blog.fleek.network and check our documentation https://docs.fleek.network to learn more, please 🙏";
const MSG_WARNING_ASSISTED_AI =
  "-----------------------------------\n\n🤖 Please note that this text was generated by an AI-powered assistant. While we try to provide accurate and helpful information, it's always advisable to double-check with original knowledge sources, e.g. docs.";

// Mongodb init
(async () => {
  try {
    const {
      MONGO_INITDB_ROOT_USERNAME,
      MONGO_INITDB_ROOT_PASSWORD,
      MONGO_DB_NAME,
    } = process.env;

    if (
      !MONGO_INITDB_ROOT_USERNAME ||
      !MONGO_INITDB_ROOT_PASSWORD ||
      !MONGO_DB_NAME
    )
      throw Error("Oops! Missing one or more mongo env vars");

    await mongoose.connect(`mongodb://mongodb:27017/${MONGO_DB_NAME}`, {
      authSource: "admin",
      user: MONGO_INITDB_ROOT_USERNAME,
      pass: MONGO_INITDB_ROOT_PASSWORD,
    });
  } catch (err) {
    console.error(err);

    throw new Error("Oops! Failed to connect to mongo");
  }
})();

const mongoQuerySchema = new mongoose.Schema({
  query: String,
  response: String,
});
const MongoQuery = mongoose.model("Query", mongoQuerySchema);

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

const sendMsgFoundLLMAnswer = ({
  msg,
  user,
  response,
}: {
  msg: Message;
  user: User;
  response: string;
}) => {
  msg.channel.send(
    `👋 Hey ${user.toString()} ${response}\n\n${MSG_WARNING_ASSISTED_AI}`,
  );
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
  if (msg.author.bot) return;

  const { channelId } = msg;

  if (!whitelistChannelIds.includes(channelId)) {
    console.log(`[debug] blocked channelId ${channelId}`);
    return;
  }

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
    msg.content.match(/.*[wW]h?en.*(reward|incentive)s?/gm) ||
    msg.content.match(/.*[hH]ow.*get.*rewards?/gm) ||
    msg.content.match(/.*([aA]re|[iI]s).*testnet.*incentiv(es|ised)/gm)
  ) {
    msg.channel.send(
      `👀 Hey ${msg.author.toString()}, seems that you are talking about incentives or rewards? We're working hard to make sure that the rewards mechanism is top-notch before we roll it out. Our team takes great care to deploy and test under the testnet, but it's important to note that the testnet is not incentivized. Therefore, rewards and incentives will only be available on the mainnet after passing rigorous tests. Rest assured, we're doing everything we can to make sure that you'll be rewarded for your efforts. To learn more visit the documentation site https://docs.fleek.network, thanks for your patience and understanding!`,
    );
  }

  if (
    msg.content.match(/.*[iI]s.*(it|node).*working/gm) ||
    msg.content.match(
      /.*[hH]ow.*if.*node.*working/gm ||
        msg.content.match(/.*[iI]s.*it.*working.*properly/gm) ||
        msg.content.match(/.*logs.*([oO][kK]|good|normal)/gm) ||
        msg.content.match(/.*(normal|correct).*logs/gm),
    )
  ) {
    msg.channel.send(
      `👀 Hey ${msg.author.toString()}, to verify if your node is running correctly do a health checkup!

To do a health check run the command in the server:

\`\`\`
curl -sS https://get.fleek.network/healthcheck | bash
\`\`\`

To learn more visit https://docs.fleek.network/docs/node/health-check
      `,
    );
  }

  if (
    ["gm", "gn"].some((greeting) =>
      msg.content.toLowerCase().startsWith(greeting),
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
    const user = msg.author;
    let query = msg.content.split(`${PREFIX}ask`)[1];
    query = query.replace(/[\W_]+/g, " ").trim();
    const cacheQuery = await mongoose.model("Query").findOne({
      query,
    });

    if (cacheQuery?.response) {
      sendMsgFoundLLMAnswer({
        msg,
        user,
        response: cacheQuery.response,
      });

      return;
    }

    msg.channel.send(
      `👀 Hey ${user.toString()} received the query "${query}", please be patient while I check..`,
    );

    const job = await llmQueue
      .createJob({
        channelId,
        query,
        user,
      })
      .save();

    job
      .on("succeeded", async (response) => {
        sendMsgFoundLLMAnswer({
          msg,
          user,
          response,
        });

        try {
          const mquery = new MongoQuery({
            query,
            response,
          });
          await mquery.save();
        } catch (err) {
          console.error("Oops! Failed to save query");
        }
      })
      .on("progress", () => {
        console.log("Job progress");
      })
      .on("failed", () => {
        console.log("Job failed");
      });
  }

  if (msg.content.startsWith(`${PREFIX}help`)) {
    // Warning: the text literal lack of indentation has a purpose, do not change
    msg.channel.send(
      `👀 Hey ${msg.author.toString()}!

\r\n**How to Get Help**
- Before asking: Try to find the solution yourself. (CTRL + F in this server can answer a lot of questions)
- Skip "I need help", "Help please", "Can I ask a thing", "I have an error" - Yes you can! Getting help is what this server is for!

**Help Us to Help You**
- Imagine you are the one trying to help. Ask the question in a way that you would want to read!
- Try to find the answer in the documentation site, e.g. use the search option
- Read the responses you are given.
- Research key words you do not understand before asking what they mean. (come back and ask, if you cannot find them)

**No Answer?**
- Do not mention uninvolved people to get a response.
- Try to give more context / improve your description.
- Try to find a solution yourself while waiting
- Try to rephrase your question.

**Chat commands**
- !search <query> e.g. !search how to install
- !ask <query> e.g. !ask how to do a healthcheck

**To learn more visit:**
<https://docs.fleek.network>

**For Node Operator options tools run:**
\`\`\`
curl https://get.fleek.network | bash
\`\`\`
      `,
    );
  }
});

llmQueue.process(async (job: Job) => {
  const { query } = job.data;

  try {
    const res = await axios.get(
      `http://${process.env.LLM_INDEXER_HOSTNAME}:${process.env.LLM_INDEXER_PORT}/query?question=${query}`,
    );

    return res.data.answer;
  } catch (err) {
    console.error(err);
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
