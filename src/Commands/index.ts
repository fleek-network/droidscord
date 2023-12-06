import { Message } from "discord.js";
import { Docs, sendCreateThreadMsg } from "../Utils/index.js";
import { AlgoliaHit, algoliaIndex } from "../Utils/algolia.js";

const PREFIX = "!";

export enum Commands {
  Ask = `${PREFIX}ask`,
  Search = `${PREFIX}search`,
  Docs = `${PREFIX}docs`,
  Help = `${PREFIX}help`,
}

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

export const CommandTriggerLs: CommandTrigger[] = [
  CommandDocsTrigger,
  CommandSearchTrigger,
];
