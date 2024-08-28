import * as fs from 'fs-extra';
import * as path from 'path';

export class Logger {
  private logDir: string;

  constructor(userDataPath: string) {
    this.logDir = userDataPath;
  }

  /**
   * Saves a log file.
   * @param fileName The name of the log file.
   * @param logs An array of log messages.
   */
  async saveLog(fileName: string, logs: string[]): Promise<void> {
    const logPath = this.getLogPath(fileName);
    await fs.writeFile(logPath, logs.join('\n'));
  }

  /**
   * Gets the full path of a log file.
   * @param fileName The name of the log file.
   * @returns The full path of the log file.
   */
  getLogPath(fileName: string): string {
    return path.join(this.logDir, fileName);
  }
}