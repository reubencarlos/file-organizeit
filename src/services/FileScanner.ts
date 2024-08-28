import * as fs from 'fs-extra';
import * as path from 'path';

export interface FileTypeCount {
  images: number;
  audio: number;
  videos: number;
  documents: number;
  others: number;
}

export class FileScanner {
  async scanDirectory(dirPath: string): Promise<{ files: string[], typeCounts: FileTypeCount }> {
    const files: string[] = [];
    const typeCounts: FileTypeCount = { images: 0, audio: 0, videos: 0, documents: 0, others: 0 };

    const scanRecursive = async (currentPath: string) => {
      const entries = await fs.readdir(currentPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);

        if (entry.isDirectory()) {
          await scanRecursive(fullPath);
        } else if (entry.isFile()) {
          files.push(fullPath);
          this.incrementFileTypeCount(typeCounts, entry.name);
        }
      }
    };

    await scanRecursive(dirPath);
    return { files, typeCounts };
  }

  private incrementFileTypeCount(typeCounts: FileTypeCount, fileName: string) {
    const ext = path.extname(fileName).toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
      typeCounts.images++;
    } else if (['.mp3', '.wav', '.ogg'].includes(ext)) {
      typeCounts.audio++;
    } else if (['.mp4', '.avi', '.mov'].includes(ext)) {
      typeCounts.videos++;
    } else if (['.pdf', '.doc', '.docx', '.txt'].includes(ext)) {
      typeCounts.documents++;
    } else {
      typeCounts.others++;
    }
  }

  async getTotalSize(files: string[]): Promise<number> {
    let totalSize = 0;
    for (const file of files) {
      const stats = await fs.stat(file);
      totalSize += stats.size;
    }
    return totalSize;
  }
}