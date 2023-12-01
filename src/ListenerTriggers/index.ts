import {
  Client,
  IntentsBitField,
  Message,
  User,
  GuildTextBasedChannel,
  TextChannel,
} from "discord.js";
import dayjs from "dayjs";
import { whitelistNotRequired } from '../Messages';
import assert from 'assert';

assert(process.env.WHITELIST_MSG_TIMEOUT_MINUTES, new Error('Oops! Missing WHITELIST_MSG_TIMEOUT_MINUTES env var'))

// App in-memory state
let whiteListMsgCount = 0;
let lastWhiteListMsg = dayjs();

type OnMessageCreate = {
  expr: (msg: Message) => boolean,
  cb: (msg: Message) => void,
}

const whitelistQueries: OnMessageCreate = {
  expr: (msg) => !!msg.content.includes("whitelist") ||
  !!msg.content.match(/.*(form|application|apply|join).*(test|testnet)/gm),
  cb: (msg) => {
    const currentWhiteListMsg = dayjs();
    const diffInMins = currentWhiteListMsg.diff(lastWhiteListMsg, "minute");

    if (
      whiteListMsgCount < 1 ||
      diffInMins >
        parseFloat(process.env.WHITELIST_MSG_TIMEOUT_MINUTES as string)
    ) {
      msg.channel.send(whitelistNotRequired);
      lastWhiteListMsg = currentWhiteListMsg;
      whiteListMsgCount += 1;
    }
  }
}

const installSetupQueries: OnMessageCreate = {
  expr: (msg) => !!msg.content.match(/.*([hH]ow|[cC]an).*(install|setup).*node/gm),
  cb: (msg) => {
    msg.channel.send(
      // TODO: refactor/use a text message template instead
      `👀 Hey ${msg.author.toString()}, anyone can install and run node! Check the requirements and instructions in <https://docs.fleek.network/docs/node/install>`,
    );
  },
}

export const onMessageCreate: OnMessageCreate[] = [
  whitelistQueries,
  installSetupQueries,
]