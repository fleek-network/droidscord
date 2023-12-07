import { User } from "discord.js";
import Queue from "bee-queue";
import axios from "axios";
import mongoose from "mongoose";

export type Job = {
  data: {
    query: string;
    channelId: string;
    user: User;
  };
};

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
export const MongoQuery = mongoose.model("Query", mongoQuerySchema);

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
