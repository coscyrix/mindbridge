// server.js

import ServerConfig from './config/server.config.js';

import {
  userRouter,
  userProfileRouter,
  serviceRouter,
  thrpyReqRouter,
  sessionRouter,
  invoiceRouter,
  formRouter,
} from './routes/index.js';

async function main() {
  try {
    const PORT = process.env.PORT;
    const server = new ServerConfig({
      port: PORT,
      routers: [
        userRouter,
        userProfileRouter,
        serviceRouter,
        thrpyReqRouter,
        sessionRouter,
        invoiceRouter,
        formRouter,
      ],
    });
    await server.listen();
  } catch (error) {
    console.error(`Failed to start the server: ${error.message}`);
    console.error(error);
  }
}

main();
