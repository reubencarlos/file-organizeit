import { FileScanner, FileTypeCount } from '../src/services/FileScanner';
import * as fs from 'fs-extra';
import * as path from 'path';

jest.mock('fs-extra');
jest.mock('path');

const mockedFs = jest.mocked(fs);
const mockedPath = jest.mocked(path);

describe('FileScanner', () => {
  let fileScanner: FileScanner;

  beforeEach(() => {
    fileScanner = new FileScanner();
    jest.clearAllMocks();

    // Mock path.extname to return the file extension
    mockedPath.extname.mockImplementation((fileName) => {
      const parts = fileName.split('.');
      return parts.length > 1 ? `.${parts[parts.length - 1]}` : '';
    });
  });

  describe('scanDirectory', () => {
    it('should scan directory and count file types', async () => {
      const mockFiles = [
        { name: 'image.jpg', isDirectory: () => false, isFile: () => true },
        { name: 'audio.mp3', isDirectory: () => false, isFile: () => true },
        { name: 'video.mp4', isDirectory: () => false, isFile: () => true },
        { name: 'document.pdf', isDirectory: () => false, isFile: () => true },
        { name: 'document.txt', isDirectory: () => false, isFile: () => true },
      ];

      mockedFs.readdir.mockImplementation(() => Promise.resolve(mockFiles as unknown as fs.Dirent[]));
      mockedPath.join.mockImplementation((_, fileName) => `/mock/path/${fileName}`);

      const result = await fileScanner.scanDirectory('/mock/path');

      expect(result.files).toHaveLength(5);
      expect(result.typeCounts).toEqual({
        images: 1,
        audio: 1,
        videos: 1,
        documents: 2,
        others: 0,
      });
    });

    it('should handle nested directories', async () => {
      const mockFiles = [
        { name: 'subdir', isDirectory: () => true, isFile: () => false },
        { name: 'image.png', isDirectory: () => false, isFile: () => true },
      ];

      const mockSubdirFiles = [
        { name: 'subimage.jpg', isDirectory: () => false, isFile: () => true },
      ];

      mockedFs.readdir
        .mockImplementationOnce(() => Promise.resolve(mockFiles as unknown as fs.Dirent[]))
        .mockImplementationOnce(() => Promise.resolve(mockSubdirFiles as unknown as fs.Dirent[]));

      mockedPath.join.mockImplementation((_, fileName) => `/mock/path/${fileName}`);

      const result = await fileScanner.scanDirectory('/mock/path');

      expect(result.files).toHaveLength(2);
      expect(result.typeCounts.images).toBe(2);
    });
  });

  describe('getTotalSize', () => {
    it('should calculate total size of files', async () => {
      const mockFiles = ['/mock/file1', '/mock/file2'];
      mockedFs.stat.mockImplementation(() => Promise.resolve({ size: 1024 } as fs.Stats));

      const totalSize = await fileScanner.getTotalSize(mockFiles);

      expect(totalSize).toBe(2048);
      expect(mockedFs.stat).toHaveBeenCalledTimes(2);
    });
  });
});