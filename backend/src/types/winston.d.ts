declare module 'winston' {
  export interface Logger {
    level: string;
    addColors(colors: Record<string, string>): void;
    createLogger(options: any): Logger;
    format: {
      combine: (...args: any[]) => any;
      timestamp: () => any;
      colorize: () => any;
      json: () => any;
      simple: () => any;
      align: () => any;
    };
    transports: {
      Console: any;
      File: any;
      DailyRotateFile: any;
    };
    exceptionHandlers: any[];
    rejectionHandlers: any[];
    exitOnError: boolean;
    stream: any;
  }
}

export interface Format {
  combine: (...args: any[]) => any;
  timestamp: () => any;
  colorize: () => any;
  json: () => any;
  simple: () => any;
  align: () => any;
}

export interface Transport {
  Console: any;
  File: any;
  DailyRotateFile: any;
}