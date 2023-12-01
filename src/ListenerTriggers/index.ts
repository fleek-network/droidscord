import {
  Client,
  IntentsBitField,
  Message,
  User,
  GuildTextBasedChannel,
  TextChannel,
} from "discord.js";
import dayjs from "dayjs";
import { whitelistNotRequired } from '../Messages/index.js';
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
      msg.reply(whitelistNotRequired);
      lastWhiteListMsg = currentWhiteListMsg;
      whiteListMsgCount += 1;
    }
  }
}

const installSetupQueries: OnMessageCreate = {
  expr: (msg) => !!msg.content.match(/.*([hH]ow|[cC]an).*(install|setup).*node/gm),
  cb: (msg) => {
    msg.reply(
      // TODO: refactor/use a text message template instead
      `👀 Hey ${msg.author.toString()}, anyone can install and run node! Check the requirements and instructions in <https://docs.fleek.network/docs/node/install>`,
    );
  },
}

const RolesQueries: OnMessageCreate = {
  expr: (msg) => !!(msg.content.match(/.*[hH]ow.*(get|pick).*roles?/gm) || msg.content.match(/.*([wW]hat|[ww]here).*happen.*node.*role/gm) || msg.content.match(/.*([wW]hy|[wW]here|[hH]ad|[hH]ave).*role.*(delete|remove|lost|disappear|vanish)/gm) || msg.content.match(/.*([nN]o).*node.*role/gm)),
  cb: (msg) => {
    msg.reply(
      `👀 Hey ${msg.author.toString()}, if you are looking for roles, go to <id:customize> to pick roles.`,
    );
  },
}

const RewardIncentivesQueries: OnMessageCreate = {
  expr: (msg) => !!(
    msg.content.match(/.*[wW]h?en.*(reward|incentive|token)s?/gm) ||
    msg.content.match(/.*[hH]ow.*get.*rewards?/gm) ||
    msg.content.match(/.*([aA]re|[iI]s).*testnet.*incentiv(es|ised)/gm)
  ),
  cb: (msg) => {
    msg.reply(
      `👀 Hey ${msg.author.toString()}, seems that you are talking about incentives or rewards? We're working hard to make sure that the rewards mechanism is top-notch before we roll it out. Our team takes great care to deploy and test under the testnet, but it's important to note that the testnet is not incentivized. Therefore, rewards and incentives will only be available on the mainnet after passing rigorous tests. Rest assured, we're doing everything we can to make sure that you'll be rewarded for your efforts. To learn more visit the documentation site https://docs.fleek.network, thanks for your patience and understanding!`,
    );
  },
}

const NodeWorkingCorrectlyQueries: OnMessageCreate = {
  expr: (msg) => !!(
    msg.content.match(/.*[iI]s.*(it|node).*working/gm) ||
    msg.content.match(/.*[hH]ow.*if.*node.*working/gm) ||
    msg.content.match(/.*[iI]s.*it.*working.*properly/gm) ||
    msg.content.match(/.*logs.*([oO][kK]|good|normal)/gm) ||
    msg.content.match(/.*(normal|standard|correct).*logs/gm)
  ),
  cb: (msg) => {
    msg.reply(
      `👀 Hey ${msg.author.toString()}, to verify if your node is running correctly do a health checkup!

To do a health check run the command in the server:

\`\`\`
curl -sS https://get.fleek.network/healthcheck | bash
\`\`\`

To learn more visit https://docs.fleek.network/docs/node/health-check
      `,
    );
  },
}

export const onMessageCreate: OnMessageCreate[] = [
  whitelistQueries,
  installSetupQueries,
  RolesQueries,
  RewardIncentivesQueries,
  NodeWorkingCorrectlyQueries,
]