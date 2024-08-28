import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs-extra';
import { parse, format } from 'date-fns';
import { FileScanner } from './services/FileScanner';
import { FileOrganizer } from './services/FileOrganizer';
import { DiskSpaceChecker } from './services/DiskSpaceChecker';
import { Logger } from './services/Logger';

let mainWindow: BrowserWindow | null;

/**
 * Creates the main application window.
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 888,
    height: 888,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: process.env.NODE_ENV !== 'production' // Only disable in development
    },
    title: 'OrganizeIt!',
  });

  const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
  mainWindow.loadFile(indexPath).catch(err => console.error('Failed to load file:', err));
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Initialize services
const fileScanner = new FileScanner();
const fileOrganizer = new FileOrganizer();
const diskSpaceChecker = new DiskSpaceChecker();
const logger = new Logger(app.getPath('userData'));

/**
 * Handles the open directory dialog.
 */
ipcMain.handle('dialog:openDirectory', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openDirectory']
  });
  return canceled ? undefined : filePaths[0];
});

/**
 * Handles the media scanning process.
 */
ipcMain.handle('scan:media', async (_, sourcePath: string, destPath: string) => {
  try {
    await fs.access(sourcePath, fs.constants.R_OK);
    await fs.access(destPath, fs.constants.W_OK);

    const scanResult = await fileScanner.scanDirectory(sourcePath);

    if (scanResult.files.length === 0) {
      return { error: 'No files found in the source directory' };
    }

    try {
      const totalSize = await fileScanner.getTotalSize(scanResult.files);
      const { free } = await diskSpaceChecker.getDiskSpace(destPath);
      
      if (free < totalSize) {
        return { error: 'Insufficient space in destination folder' };
      }
    } catch (spaceError: unknown) {
      console.error('Error checking disk space:', spaceError);
      return { error: `Error checking disk space: ${spaceError instanceof Error ? spaceError.message : String(spaceError)}` };
    }

    return scanResult;
  } catch (error: unknown) {
    console.error('Error scanning media:', error);
    return { error: `Error scanning media: ${error instanceof Error ? error.message : String(error)}` };
  }
});

/**
 * Handles the media organization process.
 */
ipcMain.handle('organize:media', async (_, sourcePath: string, destPath: string, fileCount: number) => {
  try {
    const { files } = await fileScanner.scanDirectory(sourcePath);
    const results = await fileOrganizer.organizeFiles(files, destPath, (progress, log) => {
      mainWindow!.webContents.send('organize:progress', progress);
      mainWindow!.webContents.send('organize:log', log);
    });

    const logFileName = `organize_log_${format(new Date(), 'yyyyMMdd_HHmmss')}.txt`;
    await logger.saveLog(logFileName, results.logs);

    mainWindow!.webContents.send('organize:log', `Log saved to ${logger.getLogPath(logFileName)}`);

    return results.organizedFiles;
  } catch (error) {
    console.error('Error organizing media:', error);
    throw error;
  }
});