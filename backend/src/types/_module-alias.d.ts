// This file helps TypeScript understand module aliases
// It tells TypeScript that imports starting with @/ should be resolved from the src directory

declare module '@/app' {
  import { Application } from 'express';
  import { Server } from 'http';
  
  const app: Application;
  const server: Server;
  
  export { app, server };
}

declare module '@/config/*' {
  const value: any;
  export default value;
}

declare module '@/models/*' {
  import { Model, Document } from 'mongoose';
  const model: Model<Document>;
  export default model;
}

declare module '@/middleware/*' {
  import { RequestHandler } from 'express';
  const handler: RequestHandler;
  export default handler;
}

declare module '@/utils/*' {
  const util: any;
  export default util;
}

declare module '@/routes' {
  import { Router } from 'express';
  const router: Router;
  export default router;
}
