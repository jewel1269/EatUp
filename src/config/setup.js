// Import necessary packages
import AdminJS from 'adminjs';
import AdminJSFastify from '@adminjs/fastify';
import * as AdminJsMongoose from '@adminjs/mongoose';
import * as models from '../models/index.js'; // Ensure this path is correct
import fastifySession from 'fastify-session';
import { sessionStore, authenticate, SECRET, SECRET_PASS } from './config.js';
import {dark, light} from "@adminjs/themes"
// Register Mongoose adapter
AdminJS.registerAdapter(AdminJsMongoose);

// Initialize AdminJS
const admin = new AdminJS({
  resources: [
    {
      resource: models.Customer,
      options: {
        listProperties: ['phone', 'role', 'isActivated'],
        filterProperties: ['phone', 'role'],
      },
    },
    {
      resource: models.DeliveryPartner,
      options: {
        listProperties: ['email', 'role', 'isActivated'],
        filterProperties: ['email', 'role'],
      },
    },
    {
      resource: models.Admin,
      options: {
        listProperties: ['email', 'role', 'isActivated'],
        filterProperties: ['email', 'role'],
      },
    },
    {
      resource: models.Branch,
    },
    {
      resource: models.Category,
    },
    {
      resource: models.Product,
    },
  ],
  branding: {
    companyName: 'EatUp',
    withMadeWithLove: false,
    favicon:"https://i.ibb.co.com/M51cN7x/images-removebg-preview-1.png",
    defailtTheme: dark.id,
    availableTheme: [dark, light]
  },
  rootPath: '/admin',
});

// Build the AdminJS router with authentication
const buildAdminRouter = async (app, session) => {
  const router = await AdminJSFastify.buildAuthenticatedRouter(
    admin,
    {
      authenticate: authenticate,
      secretPass:SECRET_PASS,
      secretName: "adminjs"
    },
    app,
    {
      store: sessionStore,
      saveUninitialized: true,
      secret: SECRET
    }
  );

};

// Export necessary items
export { admin, buildAdminRouter };
