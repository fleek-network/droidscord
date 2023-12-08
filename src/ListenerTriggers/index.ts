import { Message, TextChannel } from "discord.js";
import dayjs from "dayjs";
import {
  whitelistNotRequired,
  aboutWhitelisting,
  anyoneCanInstall,
  nodeSetup,
  channelsRoles,
  lookingForRoles,
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
    !!msg.content.match(/.*(form|application|apply|join).*(test|testnet)/gm),
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
      msg.content.match(/.*([aA]re|[iI]s).*testnet.*incentiv(es|ised)/gm)
    ),
  cb: async (msg) => {
    // TODO: use text tmplt instead
    const message = `👀 Hey ${msg.author.toString()}, seems that you are talking about incentives or rewards? We're working hard to make sure that the rewards mechanism is top-notch before we roll it out. Our team takes great care to deploy and test under the testnet, but it's important to note that the testnet is not incentivized. Therefore, rewards and incentives will only be available on the mainnet after passing rigorous tests. Rest assured, we're doing everything we can to make sure that you'll be rewarded for your efforts. To learn more visit the documentation site https://docs.fleek.network, thanks for your patience and understanding!`;

    await sendCreateThreadMsg({
      msg,
      name: "Incentives and Rewards",
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
    // TODO: use text tmplt instead
    const message = `👀 Hey ${msg.author.toString()}, to verify if your node is running correctly do a health checkup!

To do a health check run the command in the server:

\`\`\`
curl -sS https://get.fleek.network/healthcheck | bash
\`\`\`

To learn more visit https://docs.fleek.network/docs/node/health-check
      `;

    await sendCreateThreadMsg({
      msg,
      name: "Health checkups",
      message,
    });
  },
};

const WatchLogsQueries: OnMessageCreate = {
  expr: (msg) =>
    !!msg.content.match(/([hH]ow|[wW]hat).*(check|view|watch).*logs/gm),
  cb: async (msg) => {
    // TODO: use text tmplt instead
    const message = `👀 Hey ${msg.author.toString()}, if you'd like to learn about logs visit the documentation https://docs.fleek.network/docs/node/analyzing-logs but in general, a health checkup is all you have to do! The logs are useful mostly you are troubleshooting issues, asserting something or developing.

To run a health check do:

\`\`\`
curl -sS https://get.fleek.network/healthcheck | bash
\`\`\`

To learn more visit https://docs.fleek.network/docs/node/health-check
      `;

    await sendCreateThreadMsg({
      msg,
      name: "Analyzing logs",
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
    // TODO: use text tmplt instead
    const message = `👀 Hey ${msg.author.toString()}, have you tried typing **!help** command in the channel to find the different ways to get help? If you have done that already, be patient, thank you!`;

    await sendCreateThreadMsg({
      msg,
      name: "Looking for help",
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
    // TODO: use text tmplt instead
    const message = `👀 Hey ${msg.author.toString()}, for testnet announcements and requirements you have to keep an eye in the announcements in <#994686135789953106> and <#1148719641896693873>.
      
Alternatively, you can keep visit our Blog site (<https://blog.fleek.network/>) or follow us on Twitter (<https://twitter.com/fleek_net>).
      
Thanks for your patience and understanding!`;

    await sendCreateThreadMsg({
      msg,
      name: "About next testnet phase",
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

    // TODO: use text tmplt instead
    const message = `${msg.author.toString()} for greetings use the channel <#${
      process.env.DISCORD_CHANNEL_ID_GM_GN
    }>`;

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
