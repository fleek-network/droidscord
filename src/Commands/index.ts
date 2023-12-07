import { Message } from "discord.js";
import { Docs, sendCreateThreadMsg } from "../Utils/index.js";
import { AlgoliaHit, algoliaIndex } from "../Utils/algolia.js";
// import Queue from "bee-queue";
import mongoose from "mongoose";
import { warningAssistedAI } from "../Messages/index.js";

const PREFIX = "!";

// type Job = {
//   data: {
//     query: string;
//     channelId: string;
//     user: User;
//   };
// };

export enum Commands {
  Ask = `${PREFIX}ask`,
  Search = `${PREFIX}search`,
  Docs = `${PREFIX}docs`,
  Help = `${PREFIX}help`,
}

// const sharedConfig = {
//   isWorker: true,
//   removeOnSuccess: true,
//   redis: {
//     host: process.env.REDIS_HOSTNAME,
//   },
// };
// const llmQueue = new Queue("LLM_QUERY", sharedConfig);

// Const
export const whitelistChannelIds = (() => {
  if (!process.env.WHITELIST_CHANNEL_IDS) {
    throw new Error("Oops! The WHITELIST_CHANNEL_IDS env var is not set");
  }

  const data = process.env.WHITELIST_CHANNEL_IDS.split(",");

  if (!data.length) {
    throw new Error("Oops! Empty WHITELIST_CHANNEL_IDS env var");
  }

  return [...data];
})();

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

interface CommandTrigger {
  expr: (msg: Message) => boolean;
  cb: (msg: Message) => void;
}

const CommandDocsTrigger: CommandTrigger = {
  expr: (msg) => msg.content.startsWith(Commands.Docs),
  cb: (msg) => {
    if (msg.content === Commands.Docs) {
      msg.reply(`Visit the documentation site at ${Docs.Site}`);

      return;
    }

    const re = /^!docs\s(<@\d+>)$/g;
    const match = msg.content.matchAll(re);

    if (match) {
      try {
        const user = [...match][0][1];

        // TODO: Use text template
        // TODO: Use thread response helper fn
        msg.reply(
          `👋 Hey ${user}, visit the documentation site at ${Docs.Site}`,
        );
      } catch (err) {
        console.error(`Oops! Failed to send docs site url to user`);
      }
    }
  },
};

const CommandSearchTrigger: CommandTrigger = {
  // TODO: replace ${PREFIX}cmd with enum version
  expr: (msg) => msg.content.startsWith(`${PREFIX}search`),
  cb: async (msg) => {
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

    await sendCreateThreadMsg({
      msg,
      name: `Search for "${query}"`,
      message,
      duration: 120, // 120 is two hours
    });
  },
};

const CommandAskTrigger: CommandTrigger = {
  expr: (msg) => msg.content.startsWith(Commands.Ask),
  cb: async (msg) => {
    const user = msg.author;
    let query = msg.content.split(Commands.Ask)[1];
    query = query.replace(/[\W_]+/g, " ").trim();
    const cacheQuery = await mongoose.model("Query").findOne({
      query,
    });

    if (cacheQuery?.response) {
      const message = `👋 Hey ${user.toString()} ${
        cacheQuery.response
      }\n\n${warningAssistedAI}`;

      await sendCreateThreadMsg({
        msg,
        name: query,
        message,
        duration: 60, // 60 is an hour
      });

      return;
    }

    const message = `👀 Hey ${user.toString()} received the query "${query}", please be patient while I check..`;

    const thread = await sendCreateThreadMsg({
      msg,
      name: query,
      message,
    });

    const job = await llmQueue
      .createJob({
        channelId: msg.channelId,
        query,
        user,
      })
      .save();

    job
      .on("succeeded", async (response) => {
        const message = `👋 Hey ${user.toString()} ${response}\n\n${warningAssistedAI}`;

        await thread.send(message);

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
  },
};

export const CommandHelpTrigger: CommandTrigger = {
  expr: (msg) => !!msg.content.startsWith(Commands.Help),
  cb: async (msg) => {
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
      name: "Looking for help?",
      message,
      duration: 60, // 60 is an hour
    });
  },
};

export const CommandTriggerLs: CommandTrigger[] = [
  CommandDocsTrigger,
  CommandSearchTrigger,
  CommandAskTrigger,
  CommandHelpTrigger,
];
