import { loadConfig } from "./config.js";
import { buildApp } from "./app.js";
const config=loadConfig();
const app=await buildApp(config);
await app.listen({host:"127.0.0.1",port:config.PORT});
