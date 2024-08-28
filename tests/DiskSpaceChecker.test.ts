import { DiskSpaceChecker } from '../src/services/DiskSpaceChecker';
import * as childProcess from 'child_process';
import * as path from 'path';
import { promisify } from 'util';

jest.mock('child_process');
jest.mock('path');
jest.mock('util');

const mockedExec = childProcess.exec as jest.MockedFunction<typeof childProcess.exec>;
const mockedPath = jest.mocked(path);
const mockedPromisify = promisify as jest.MockedFunction<typeof promisify>;

describe('DiskSpaceChecker', () => {
  let diskSpaceChecker: DiskSpaceChecker;
  let mockedExecAsync: jest.Mock;

  beforeEach(() => {
    mockedExecAsync = jest.fn();
    mockedPromisify.mockReturnValue(mockedExecAsync);
    
    diskSpaceChecker = new DiskSpaceChecker();
  });

  describe('getDiskSpace', () => {
    it('should get disk space for Windows', async () => {
      Object.defineProperty(process, 'platform', { value: 'win32' });
      mockedPath.parse.mockReturnValue({ root: 'C:\\', dir: 'C:\\', base: '', ext: '', name: '' });
      mockedExecAsync.mockResolvedValue({ stdout: 'Node,FreeSpace,Size\nC:,1000000000,2000000000\n' });

      const result = await diskSpaceChecker.getDiskSpace('C:\\path\\to\\dir');

      expect(result).toEqual({ free: 1000000000, total: 2000000000 });
      expect(mockedExecAsync).toHaveBeenCalledWith(expect.stringContaining('wmic'));
    });

    it('should get disk space for Unix-like systems', async () => {
      Object.defineProperty(process, 'platform', { value: 'linux' });
      mockedExecAsync.mockResolvedValue({ stdout: 'Filesystem 1K-blocks Used Available Use% Mounted on\n/dev/sda1 20000000 10000000 10000000 50% /' });

      const result = await diskSpaceChecker.getDiskSpace('/path/to/dir');

      expect(result).toEqual({ free: 10000000 * 1024, total: 20000000 * 1024 });
      expect(mockedExecAsync).toHaveBeenCalledWith(expect.stringContaining('df -k'));
    });

    it('should handle errors', async () => {
      mockedExecAsync.mockRejectedValue(new Error('Command failed'));

      await expect(diskSpaceChecker.getDiskSpace('/path')).rejects.toThrow('Command failed');
    });
  });
});