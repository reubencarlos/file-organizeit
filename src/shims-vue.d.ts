declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface ElectronAPI {
  openDirectory: () => Promise<string | undefined>;
  organizeMedia: (sourcePath: string, destPath: string) => Promise<{ file: string; status: string; }[]>;
  onProgress: (callback: (progress: { current: number; total: number; }) => void) => void;
  onLog: (callback: (message: string) => void) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}