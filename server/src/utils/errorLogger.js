import { createLogger, format, transports } from "winston";
import dayjs from "dayjs";
import chalk from "chalk";
import fs from "fs";
import path from "path";

const customTimestamp = format((info) => {
  info.timestamp = dayjs().format("DD-MM-YYYY hh:mm:ss A");
  return info;
});

const getLogger = (logLocation = "logs/error.log") => {
  const logPath = path.resolve(logLocation);
  fs.mkdirSync(path.dirname(logPath), { recursive: true });

  return createLogger({
    level: "info",
    format: format.combine(
      customTimestamp(),
      format.printf(({ timestamp, level, message }) => {
        const colorLevel =
          level === "error"
            ? chalk.red(level)
            : level === "warn"
              ? chalk.yellow(level)
              : chalk.green(level);
        return `${timestamp} [${colorLevel}]: ${message}`;
      }),
    ),
    transports: [
      new transports.File({
        filename: logPath, // ✅ Corrected here
        format: format.combine(
          format.uncolorize(),
          format.printf(
            ({ timestamp, level, message }) =>
              `${timestamp} [${level}]: ${message}\n`,
          ),
        ),
      }),
      // new transports.Console(),
    ],
  });
};

const defaultLogger = getLogger();
export default defaultLogger;
export { getLogger };
