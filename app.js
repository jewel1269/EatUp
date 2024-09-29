import { fastify } from "fastify";
import { connectDB } from "./src/config/connect.js";
import { PORT } from "./src/config/config.js";
import dotenv from "dotenv";
import { admin, buildAdminRouter } from "./src/config/setup.js";
import crypto from "crypto";
import { registerRoutes } from "./src/routes/index.js";
import fastifySocketIO from "fastify-socket.io";

dotenv.config();

const start = async () => {
  const app = fastify();
  const uri = process.env.MONGO_URI;

  // Connect to the database
  await connectDB(uri);

  // Register Socket.io with CORS and websocket support
  app.register(fastifySocketIO, {
    cors: {
      origin: "*", // Allow all origins, adjust this in production for security
    },
    pingInterval: 10000,
    pingTimeout: 5000,
    transports: ["websocket"],
  });

  // Register application routes
  await registerRoutes(app);

  // Set up the admin panel router
  await buildAdminRouter(app);

  // Start the server and listen on the specified port
  app.listen({ port: PORT }, (err, addr) => {
    if (err) {
      console.error(err);
      process.exit(1); // Exit if there's an error starting the server
    } else {
      console.log(
        `EatUp started successfully on http://localhost:${PORT}${admin.options.rootPath}`
      );
    }
  });

  // When the app is ready, set up socket.io connection handling
  app.ready().then(() => {
    app.io.on("connection", (socket) => {
      console.log("New client connected");

      // Example: Handling a message event from a client
      socket.on("joinroom", (orderId) => {
        socket.join(orderId);
        console.log(` 🔴 User  joined room ${orderId}`);
      });

      // Handle client disconnect
      socket.on("disconnect", () => {
        console.log("Client disconnected ❌");
      });
    });
  });
};

start();
