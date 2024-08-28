import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

export class DiskSpaceChecker {
  private execAsync: (command: string) => Promise<{ stdout: string; stderr: string }>;

  constructor() {
    this.execAsync = promisify(exec);
  }

  async getDiskSpace(dirPath: string): Promise<{ free: number, total: number }> {
    if (process.platform === 'win32') {
      return this.getWindowsDiskSpace(dirPath);
    } else {
      return this.getUnixDiskSpace(dirPath);
    }
  }

  private async getWindowsDiskSpace(dirPath: string): Promise<{ free: number, total: number }> {
    const driveLetter = path.parse(dirPath).root;
    if (!driveLetter) {
      throw new Error('Unable to determine drive letter');
    }
    const { stdout } = await this.execAsync(`wmic logicaldisk where DeviceID="${driveLetter.charAt(0)}:" get FreeSpace,Size /format:csv`);
    const lines = stdout.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('Unexpected WMIC output format');
    }
    const data = lines[lines.length - 1];
    const [, freeSpace, size] = data.split(',');
    if (!freeSpace || !size) {
      throw new Error('Unable to parse disk space information');
    }
    return {
      free: parseInt(freeSpace),
      total: parseInt(size)
    };
  }

  private async getUnixDiskSpace(dirPath: string): Promise<{ free: number, total: number }> {
    const { stdout } = await this.execAsync(`df -k "${dirPath}"`);
    const lines = stdout.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('Unexpected df output format');
    }
    const [, size, used] = lines[1].split(/\s+/);
    if (!size || !used) {
      throw new Error('Unable to parse disk space information');
    }
    const free = parseInt(size) - parseInt(used);
    return {
      free: free * 1024, // Convert to bytes
      total: parseInt(size) * 1024 // Convert to bytes
    };
  }
}