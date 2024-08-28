import * as fs from 'fs-extra';
import * as path from 'path';
import { parse, format } from 'date-fns';

export class FileOrganizer {
  /**
   * Organizes files into the destination directory.
   * @param files The list of file paths to organize.
   * @param destPath The destination directory.
   * @param progressCallback A callback function to report progress and logs.
   * @returns An object containing the organized files and logs.
   */
  async organizeFiles(
    files: string[],
    destPath: string,
    progressCallback: (progress: { current: number, total: number }, log: string) => void
  ): Promise<{ organizedFiles: { file: string, status: string }[], logs: string[] }> {
    const totalFiles = files.length;
    let processedFiles = 0;
    const organizedFiles = [];
    const logs = [`Started organizing at ${new Date().toISOString()}`];

    for (const file of files) {
      const { destFile, year, month } = await this.getDestinationInfo(file, destPath);
      
      let status: string;
      if (!await fs.pathExists(destFile)) {
        await fs.copy(file, destFile);
        status = 'Copied successfully';
      } else {
        status = 'File already exists';
      }

      const logMessage = `${path.basename(file)} to ${year}/${month}... ${status}`;
      logs.push(logMessage);
      organizedFiles.push({ file: path.basename(file), status });
      processedFiles++;
      progressCallback({ current: processedFiles, total: totalFiles }, logMessage);
    }

    logs.push(`Finished organizing at ${new Date().toISOString()}`);
    return { organizedFiles, logs };
  }

  private async getDestinationInfo(file: string, destPath: string) {
    const stats = await fs.stat(file);
    const creationDate = parse(stats.birthtime.toISOString(), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx", new Date());
    const year = format(creationDate, 'yyyy');
    const month = format(creationDate, 'MM');
    
    const destFolder = path.join(destPath, year, month);
    await fs.ensureDir(destFolder);
    
    const destFile = path.join(destFolder, path.basename(file));

    return { destFile, year, month };
  }
}