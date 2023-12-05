import * as dotenv from "dotenv";
import algoliasearch from "algoliasearch";
import { Client, IntentsBitField, User, TextChannel } from "discord.js";
import axios from "axios";
import Queue from "bee-queue";
import mongoose from "mongoose";
import { onMessageCreate } from "./ListenerTriggers/index.js";
import {
  sendMsgToUser,
  sendMsgToChannel,
  sendMsgCommonHandler,
  sendCreateThreadMsg,
} from "./Utils/index.js";
import { warningAssistedAI } from "./Messages/index.js";

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

  // Traverse listener triggers
  onMessageCreate.forEach(({ expr, cb }) => expr(msg) && cb(msg));

  if (msg.content.startsWith(`${PREFIX}docs`)) {
    if (msg.content === `${PREFIX}docs`) {
      msg.reply(`Visit the documentation site at ${Docs.Site}`);

      return;
    }

    const re = /^!docs\s(<@\d+>)$/g;
    const match = msg.content.matchAll(re);

    if (match) {
      try {
        const user = [...match][0][1];

        msg.reply(
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
    const message = `👋 Hey! Found the following results:\n\n ${answer}`;

    await sendMsgCommonHandler({
      msg,
      user: msg.author,
      message,
    });
  }

  if (msg.content.startsWith(`${PREFIX}ask`)) {
    const user = msg.author;
    let query = msg.content.split(`${PREFIX}ask`)[1];
    query = query.replace(/[\W_]+/g, " ").trim();
    const cacheQuery = await mongoose.model("Query").findOne({
      query,
    });

    if (cacheQuery?.response) {
      const message = `👋 Hey ${user.toString()} ${
        cacheQuery.response
      }\n\n${warningAssistedAI}`;

      await sendMsgCommonHandler({
        msg,
        user,
        message,
      });

      return;
    }

    msg.reply(
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
        const message = `👋 Hey ${user.toString()} ${response}\n\n${warningAssistedAI}`;

        await sendMsgCommonHandler({
          msg,
          user,
          message,
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
    // TODO: use text tmplt instead
    // Warning: the text literal lack of indentation has a purpose, do not change
    const message = `👀 Hey ${msg.author.toString()}!

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

👆 The commands only work in the Fleek Network channels

**To learn more visit:**
<https://docs.fleek.network>

**For Node Operator options tools run:**
\`\`\`
curl https://get.fleek.network | bash
\`\`\``;

    await sendCreateThreadMsg({
      msg,
      name: "help",
      message,
    });
  }
});

llmQueue.process(async (job: Job) => {
  const { query } = job.data;

  try {
    const res = await axios.get(
      `http://${process.env.LLM_INDEXER_HOSTNAME}:${process.env.LLM_INDEXER_PORT}/query?question=${query}`,
    );

    return res.data.answer as string;
  } catch (err) {
    console.error(err);
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
