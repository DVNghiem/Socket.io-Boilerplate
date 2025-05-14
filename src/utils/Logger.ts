import winston from 'winston';

export class Logger {
  private static logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
      new winston.transports.File({ filename: 'logs/combined.log' }),
    ],
  });

  public static info(message: string) {
    this.logger.info(message);
  }

  public static error(message: string) {
    this.logger.error(message);
  }

  public static debug(message: string) {
    this.logger.debug(message);
  }
}