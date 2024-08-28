import { Logger } from '../src/services/Logger';
import * as fs from 'fs-extra';
import * as path from 'path';

jest.mock('fs-extra');
jest.mock('path');

const mockedFs = jest.mocked(fs);
const mockedPath = jest.mocked(path);

describe('Logger', () => {
  let logger: Logger;
  const mockUserDataPath = '/mock/user/data';

  beforeEach(() => {
    logger = new Logger(mockUserDataPath);
    jest.clearAllMocks();
  });

  describe('saveLog', () => {
    it('should save logs to a file', async () => {
      const fileName = 'test.log';
      const logs = ['Log 1', 'Log 2', 'Log 3'];

      mockedPath.join.mockReturnValue('/mock/user/data/test.log');
      mockedFs.writeFile.mockImplementation(() => Promise.resolve());

      await logger.saveLog(fileName, logs);

      expect(mockedPath.join).toHaveBeenCalledWith(mockUserDataPath, fileName);
      expect(mockedFs.writeFile).toHaveBeenCalledWith('/mock/user/data/test.log', logs.join('\n'));
    });

    it('should handle errors when saving logs', async () => {
      const fileName = 'error.log';
      const logs = ['Error log'];

      mockedPath.join.mockReturnValue('/mock/user/data/error.log');
      mockedFs.writeFile.mockRejectedValue(new Error('Write failed') as never);

      await expect(logger.saveLog(fileName, logs)).rejects.toThrow('Write failed');
    });
  });

  describe('getLogPath', () => {
    it('should return the correct log path', () => {
      const fileName = 'test.log';
      mockedPath.join.mockReturnValue('/mock/user/data/test.log');

      const result = logger.getLogPath(fileName);

      expect(result).toBe('/mock/user/data/test.log');
      expect(mockedPath.join).toHaveBeenCalledWith(mockUserDataPath, fileName);
    });
  });
});