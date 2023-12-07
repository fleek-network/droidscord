import { User } from "discord.js";
import Queue from "bee-queue";
import axios from "axios";

export type Job = {
  data: {
    query: string;
    channelId: string;
    user: User;
  };
};

const sharedConfig = {
  isWorker: true,
  removeOnSuccess: true,
  redis: {
    host: process.env.REDIS_HOSTNAME,
  },
};
export const llmQueue = new Queue("LLM_QUERY", sharedConfig);

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
