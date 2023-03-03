export const getEnv = () => {
  const { CHANNEL_ACCESS_TOKEN, CHANNEL_SECRET, OPENAI_API_KEY } = process.env;
  if (!CHANNEL_ACCESS_TOKEN || !CHANNEL_SECRET || !OPENAI_API_KEY) {
    throw new Error("Environment variables are not found.");
  }
  return {
    CHANNEL_ACCESS_TOKEN,
    CHANNEL_SECRET,
    OPENAI_API_KEY,
  };
};
