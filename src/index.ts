import * as dotenv from "dotenv";
import { Client, IntentsBitField, User } from "discord.js";
import { onMessageCreate } from "./ListenerTriggers/index.js";
import { onCommandMsg } from "./Commands/index.js";
import { sendCreateThreadMsg } from "./Utils/index.js";
import { Commands } from "./Commands/index.js";

dotenv.config();

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildMessageTyping,
    IntentsBitField.Flags.GuildMembers,
  ],
});

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
  // TODO: make prefix cmds as constants and move to Utils
  const hasIgnoreCmd = [Commands.Search, Commands.Ask].find((term) =>
    msg.content.includes(term),
  );

  onMessageCreate.forEach(
    ({ expr, cb }) => !hasIgnoreCmd && expr(msg) && cb(msg),
  );

  onCommandMsg.forEach(({ expr, cb }) => expr(msg) && cb(msg));
});

client.login(process.env.DISCORD_BOT_TOKEN);
