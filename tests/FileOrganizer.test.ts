import { FileOrganizer } from '../src/services/FileOrganizer';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as dateFns from 'date-fns';

jest.mock('fs-extra');
jest.mock('path');
jest.mock('date-fns', () => ({
  parse: jest.fn(),
  format: jest.fn(),
}));

const mockedFs = jest.mocked(fs);
const mockedPath = jest.mocked(path);
const mockedParse = jest.mocked(dateFns.parse);
const mockedFormat = jest.mocked(dateFns.format);

describe('FileOrganizer', () => {
  let fileOrganizer: FileOrganizer;

  beforeEach(() => {
    fileOrganizer = new FileOrganizer();
    jest.clearAllMocks();
  });

  describe('organizeFiles', () => {
    it('should organize files correctly', async () => {
      const mockFiles = ['/source/file1.jpg', '/source/file2.mp3'];
      const destPath = '/destination';
      const mockDate = new Date('2023-01-15T12:00:00Z');
      mockedFs.stat.mockImplementation(() => Promise.resolve({ birthtime: mockDate } as fs.Stats));
      mockedFs.pathExists.mockImplementation(() => Promise.resolve(false));
      mockedFs.copy.mockImplementation(() => Promise.resolve());
      mockedFs.ensureDir.mockImplementation(() => Promise.resolve());
      mockedParse.mockReturnValue(mockDate);
      mockedFormat.mockReturnValue('2023');
      mockedPath.join.mockImplementation((...args) => args.join('/'));
      mockedPath.basename.mockImplementation((file) => file.split('/').pop() || '');

      const progressCallback = jest.fn();

      const result = await fileOrganizer.organizeFiles(mockFiles, destPath, progressCallback);

      expect(result.organizedFiles).toHaveLength(2);
      expect(result.logs[0]).toMatch(/Started organizing at/);
      expect(result.logs[result.logs.length - 1]).toMatch(/Finished organizing at/);
      expect(progressCallback).toHaveBeenCalledTimes(2);
      expect(mockedFs.copy).toHaveBeenCalledTimes(2);
    });

    it('should handle existing files', async () => {
      const mockFiles = ['/source/existing.jpg'];
      const destPath = '/destination';
      const mockDate = new Date('2023-01-15T12:00:00Z');

      mockedFs.stat.mockImplementation(() => Promise.resolve({ birthtime: mockDate } as fs.Stats));
      mockedFs.pathExists.mockImplementation(() => Promise.resolve(true));
      mockedFs.ensureDir.mockImplementation(() => Promise.resolve());
      mockedParse.mockReturnValue(mockDate);
      mockedFormat.mockReturnValueOnce('2023').mockReturnValueOnce('01');
      mockedPath.join.mockImplementation((...args) => args.join('/'));
      mockedPath.basename.mockImplementation((file) => file.split('/').pop() || '');

      const progressCallback = jest.fn();

      const result = await fileOrganizer.organizeFiles(mockFiles, destPath, progressCallback);

      expect(result.organizedFiles[0].status).toBe('File already exists');
      expect(mockedFs.copy).not.toHaveBeenCalled();
    });
  });
});