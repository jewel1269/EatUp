// Load environment variables from .env file
import dotenv from "dotenv";
dotenv.config();

// Import necessary packages
import fastifySession from "fastify-session";
import connectMongoDBSession from "connect-mongodb-session";
import { Admin } from "../models/index.js"; // Ensure this path is correct

// Create a MongoDB session store
const MongoDBStore = connectMongoDBSession(fastifySession);

// Configure session store
const sessionStore = new MongoDBStore({
  uri: process.env.MONGO_URI,
  collection: "EatUp",
});

// Handle session store errors
sessionStore.on("error", (error) => {
  console.log("Session store error:", error);
});

// Authentication function
const authenticate = async (email, password) => {
  if (email && password) {
    const user = await Admin.findOne({ email });
    if (!user) {
      return null;
    }
    if (user.password === password) {
      return Promise.resolve({ email, password });
    } else {
      return null;
    }
  }

  return null;
};

// Set the server port
const PORT = process.env.PORT || 3000;
const SECRET = process.env.SESSION_SECRET;
const SECRET_PASS = process.env.SESSION_PASS;

// Export necessary items
export { sessionStore, authenticate, PORT, SECRET, SECRET_PASS };
