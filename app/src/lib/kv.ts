import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

class KVError extends Error {
  constructor(
    message: string,
    public readonly operation: string,
    public readonly key: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = "KVError";
  }
}

export const setKv = async (key: string, value: string): Promise<void> => {
  try {
    if (!key) {
      throw new Error("Key cannot be empty");
    }
    if (value === undefined || value === null) {
      throw new Error("Value cannot be null or undefined");
    }

    await redis.set(key, value);
  } catch (error) {
    console.error(`Failed to set key "${key}" in KV store:`, error);
    throw new KVError(`Failed to set value in KV store`, "set", key, error);
  }
};

export const getKv = async (key: string): Promise<string | null> => {
  try {
    if (!key) {
      throw new Error("Key cannot be empty");
    }

    const value = await redis.get(key);
    return value as string | null;
  } catch (error) {
    console.error(`Failed to get key "${key}" from KV store:`, error);
    throw new KVError(`Failed to get value from KV store`, "get", key, error);
  }
};

export const updateKv = async (key: string, value: string): Promise<void> => {
  try {
    if (!key) {
      throw new Error("Key cannot be empty");
    }
    if (value === undefined || value === null) {
      throw new Error("Value cannot be null or undefined");
    }

    await redis.set(key, value);
  } catch (error) {
    console.error(`Failed to update key "${key}" in KV store:`, error);
    throw new KVError(`Failed to update value in KV store`, "update", key, error);
  }
};
