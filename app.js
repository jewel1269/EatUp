import { fastify } from "fastify";
import { connectDB } from "./src/config/connect.js";
import { PORT } from "./src/config/config.js";
import dotenv from "dotenv";
import { admin, buildAdminRouter } from "./src/config/setup.js";
import crypto from "crypto";
import { registerRoutes } from "./src/routes/index.js";

dotenv.config();

const start = async () => {
  const app = fastify();
  const uri = process.env.MONGO_URI;
  await connectDB(uri);

  await registerRoutes(app);

  await buildAdminRouter(app);

  app.listen({ port: PORT, host: "0.0.0.0" }, (err, addr) => {
    if (err) {
      console.log(err);
    } else {
      console.log(
        `EatUp started successfully on http://localhost:${PORT}${admin.options.rootPath}`
      );
    }
  });
};

start();
