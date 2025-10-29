import dotenv from "dotenv";
dotenv.config();

export const config = {
  raindrop: process.env.RAINDROP_API_KEY,
  vultr: process.env.VULTR_API_KEY,
  workos: process.env.WORKOS_API_KEY,
  stripe: process.env.STRIPE_SECRET_KEY,
  dbUrl: process.env.DATABASE_URL
};
