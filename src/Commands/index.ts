import { Message, ThreadAutoArchiveDuration } from "discord.js";
import { Docs, sendCreateThreadMsg } from "../Utils/index.js";
import { AlgoliaHit, algoliaIndex } from "../Utils/algolia.js";
import { textTemplt } from "../Utils/text.js";
import { warningAssistedAI, infoHowGetHelp } from "../Messages/index.js";
import { llmQueue, MongoQuery } from "../LLM/index.js";

const PREFIX = "!";

export enum Commands {
  Ask = `${PREFIX}ask`,
  Search = `${PREFIX}search`,
  Docs = `${PREFIX}docs`,
  Help = `${PREFIX}help`,
}

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
      duration: ThreadAutoArchiveDuration.OneHour,
    });
  },
};

const CommandAskTrigger: CommandTrigger = {
  expr: (msg) => msg.content.startsWith(Commands.Ask),
  cb: async (msg) => {
    const user = msg.author;
    let query = msg.content.split(Commands.Ask)[1];
    query = query.replace(/[\W_]+/g, " ").trim();
    const cacheQuery = await MongoQuery.findOne({
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
        duration: ThreadAutoArchiveDuration.OneWeek,
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
    const message = textTemplt({
      tmplt: infoHowGetHelp,
      placeholders: [
        {
          key: "$author",
          val: msg.author.toString(),
        },
      ],
    });

    await sendCreateThreadMsg({
      msg,
      name: "Looking for help?",
      message,
      duration: ThreadAutoArchiveDuration.OneDay,
    });
  },
};

export const onCommandMsg: CommandTrigger[] = [
  CommandDocsTrigger,
  CommandSearchTrigger,
  CommandAskTrigger,
  CommandHelpTrigger,
];
