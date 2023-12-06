import { Message } from "discord.js";
import { Docs } from "../Utils/index.js";

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
  expr: (msg) => !!msg.content.startsWith(Commands.Docs),
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

export const CommandTriggerLs: CommandTrigger[] = [CommandDocsTrigger];
