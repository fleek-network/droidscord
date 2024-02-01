import { Message, TextChannel } from "discord.js";
import dayjs from "dayjs";
import {
  whitelistNotRequired,
  aboutWhitelisting,
  anyoneCanInstall,
  nodeSetup,
  channelsRoles,
  lookingForRoles,
  lookingForRewards,
  incentivesRewards,
  isNodeWorking,
  healthCheckups,
  analyzingLogsLearnMore,
  analyzingLogs,
  canSomeoneHelp,
  lookingForHelp,
  whenNextTestnet,
  aboutNextTestnetPhase,
  forGreetingsUse,
} from "../Messages/index.js";
import assert from "assert";
import {
  deleteMsg,
  sendMsgToChannel,
  sendCreateThreadMsg,
} from "../Utils/index.js";
import { textTemplt } from "../Utils/text.js";

assert(
  process.env.WHITELIST_MSG_TIMEOUT_MINUTES,
  new Error("Oops! Missing WHITELIST_MSG_TIMEOUT_MINUTES env var"),
);
assert(
  process.env.DISCORD_CHANNEL_ID_GM_GN,
  new Error("Oops! Missing DISCORD_CHANNEL_ID_GM_GN env var"),
);

// App in-memory state
let whiteListMsgCount = 0;
let lastWhiteListMsg = dayjs();
let warningMsg: Message[] = [];

type OnMessageCreate = {
  expr: (msg: Message) => boolean;
  cb: (msg: Message) => void;
};

const whitelistQueries: OnMessageCreate = {
  expr: (msg) =>
    !!msg.content.includes("whitelist") ||
    !!msg.content.match(/.*(form|application|apply|join).*(test|testnet)/gm) ||
    !!msg.content.match(/.*[wW]h?en.*application.*approv(ed?|al)/gm),
  cb: async (msg) => {
    const currentWhiteListMsg = dayjs();
    const diffInMins = currentWhiteListMsg.diff(lastWhiteListMsg, "minute");

    if (
      whiteListMsgCount < 1 ||
      diffInMins >
        parseFloat(process.env.WHITELIST_MSG_TIMEOUT_MINUTES as string)
    ) {
      // TODO: use text tmplt instead
      await sendCreateThreadMsg({
        msg,
        name: aboutWhitelisting,
        message: whitelistNotRequired,
      });
      lastWhiteListMsg = currentWhiteListMsg;
      whiteListMsgCount += 1;
    }
  },
};

const installSetupQueries: OnMessageCreate = {
  expr: (msg) =>
    !!msg.content.match(/.*([hH]ow|[cC]an).*(install|setup).*node/gm),
  cb: async (msg) => {
    const message = textTemplt({
      tmplt: anyoneCanInstall,
      placeholders: [
        {
          key: "$author",
          val: msg.author.toString(),
        },
      ],
    });

    await sendCreateThreadMsg({
      msg,
      name: nodeSetup,
      message,
    });
  },
};

const RolesQueries: OnMessageCreate = {
  expr: (msg) =>
    !!(
      msg.content.match(/.*[hH]ow.*(get|pick).*roles?/gm) ||
      msg.content.match(/.*([wW]hat|[ww]here).*happen.*node.*role/gm) ||
      msg.content.match(
        /.*([wW]hy|[wW]here|[hH]ad|[hH]ave).*role.*(delete|remove|lost|disappear|vanish)/gm,
      ) ||
      msg.content.match(/.*([nN]o).*node.*role/gm) ||
      msg.content.match(
        /.*[wW][hH]ere.*(can|find|is|channel|with|look|are).*roles?/gm,
      ) ||
      msg.content.match(
        /.*([wW]hy|[wW]here|[lL]ook|[fF]ind|[cC]an).*(channels?|rooms?).*(close|disappear|delete|remove|vanish|gone|lost|missing|visible)/gm,
      ) ||
      msg.content.match(/.*[wW]here.*my.*roles?/gm)
    ),
  cb: async (msg) => {
    const message = textTemplt({
      tmplt: lookingForRoles,
      placeholders: [
        {
          key: "$author",
          val: msg.author.toString(),
        },
      ],
    });

    await sendCreateThreadMsg({
      msg,
      name: channelsRoles,
      message,
    });
  },
};

const RewardIncentivesQueries: OnMessageCreate = {
  expr: (msg) =>
    !!(
      msg.content.match(/.*[wW]h?en.*(reward|incentive|token)s?/gm) ||
      msg.content.match(/.*[hH]ow.*get.*rewards?/gm) ||
      msg.content.match(/.*([aA]re|[iI]s).*testnet.*incentiv(es|ised)/gm) ||
      msg.content.match(/.*([wW]h?en|[iI]s).*node.*incentiv(es?|ised)/gm)
    ),
  cb: async (msg) => {
    const message = textTemplt({
      tmplt: lookingForRewards,
      placeholders: [
        {
          key: "$author",
          val: msg.author.toString(),
        },
      ],
    });

    await sendCreateThreadMsg({
      msg,
      name: incentivesRewards,
      message,
    });
  },
};

const NodeWorkingCorrectlyQueries: OnMessageCreate = {
  expr: (msg) =>
    !!(
      msg.content.match(/.*[iI]s.*(it|node).*working/gm) ||
      msg.content.match(/.*[hH]ow.*if.*node.*working/gm) ||
      msg.content.match(/.*[iI]s.*it.*working.*properly/gm) ||
      msg.content.match(/.*logs.*([oO][kK]|good|normal)/gm) ||
      msg.content.match(/.*(normal|standard|correct).*logs/gm)
    ),
  cb: async (msg) => {
    const message = textTemplt({
      tmplt: isNodeWorking,
      placeholders: [
        {
          key: "$author",
          val: msg.author.toString(),
        },
      ],
    });

    await sendCreateThreadMsg({
      msg,
      name: healthCheckups,
      message,
    });
  },
};

const WatchLogsQueries: OnMessageCreate = {
  expr: (msg) =>
    !!msg.content.match(/([hH]ow|[wW]hat).*(check|view|watch).*logs/gm),
  cb: async (msg) => {
    const message = textTemplt({
      tmplt: analyzingLogsLearnMore,
      placeholders: [
        {
          key: "$author",
          val: msg.author.toString(),
        },
      ],
    });

    await sendCreateThreadMsg({
      msg,
      name: analyzingLogs,
      message,
    });
  },
};

const AskForHelpQueries: OnMessageCreate = {
  expr: (msg) =>
    !!msg.content.match(
      /.*[cC]an.*(someone|somebody|anyone|you|team).*help.*(me|please)?/gm,
    ),
  cb: async (msg) => {
    const message = textTemplt({
      tmplt: canSomeoneHelp,
      placeholders: [
        {
          key: "$author",
          val: msg.author.toString(),
        },
      ],
    });

    await sendCreateThreadMsg({
      msg,
      name: lookingForHelp,
      message,
    });
  },
};

const AskNextTesnetPhaseQueries: OnMessageCreate = {
  expr: (msg) =>
    !!(
      msg.content.match(
        /.*([wW]h?en|[wW]here|[wW]hat).*(next|test).*(phase|testnet)/gm,
      ) ||
      msg.content.match(/.*[wW][hH]?en.*[pP]hase.*[tT]est/gm) ||
      msg.content.match(/.*[wW][hH]?en.*testnet/gm)
    ),
  cb: async (msg) => {
    const message = textTemplt({
      tmplt: whenNextTestnet,
      placeholders: [
        {
          key: "$author",
          val: msg.author.toString(),
        },
      ],
    });

    await sendCreateThreadMsg({
      msg,
      name: aboutNextTestnetPhase,
      message,
    });
  },
};

const GreentingQueries: OnMessageCreate = {
  expr: (msg) =>
    !!["gm", "gn"].some((greeting) =>
      msg.content.toLowerCase().startsWith(greeting),
    ),
  cb: async (msg) => {
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

    const message = textTemplt({
      tmplt: forGreetingsUse,
      placeholders: [
        {
          key: "$author",
          val: msg.author.toString(),
        },
        {
          key: "$discordChannelIdGmGn",
          val: process.env.DISCORD_CHANNEL_ID_GM_GN as string,
        },
      ],
    });

    await sendMsgToChannel({
      channel: msg.channel as TextChannel,
      message,
    });
  },
};

export const onMessageCreate: OnMessageCreate[] = [
  whitelistQueries,
  installSetupQueries,
  RolesQueries,
  RewardIncentivesQueries,
  NodeWorkingCorrectlyQueries,
  WatchLogsQueries,
  AskForHelpQueries,
  AskNextTesnetPhaseQueries,
  GreentingQueries,
];
