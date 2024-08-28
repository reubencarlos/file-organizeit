<template>
  <v-app>
    <v-app-bar>
      <v-app-bar-title class="text-h5 font-weight-bold d-flex align-center">
        <span class="primary--text d-none d-sm-inline">File Organize</span>
        <span class="primary--text d-sm-none">File Organize</span>
        <span class="secondary--text">It!</span>
      </v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn
        icon
        size="small"
        @click="toggleTheme"
        class="ml-2"
        rounded="circle"
      >
        <v-icon>{{ themeIcon }}</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <v-row>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="sourcePath"
              label="Source"
              readonly
              dense
              append-inner-icon="mdi-folder"
              @click:append-inner="selectSourceFolder"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="destPath"
              label="Destination"
              readonly
              dense
              append-inner-icon="mdi-folder"
              @click:append-inner="selectDestFolder"
            ></v-text-field>
          </v-col>
        </v-row>
        <v-row justify="center" class="my-4">
          <v-col cols="auto">
            <v-btn
              color="primary"
              @click="scanMedia"
              :disabled="!canScan || scanning"
              :loading="scanning"
            >
              Scan
            </v-btn>
          </v-col>
          <v-col cols="auto">
            <v-btn
              color="success"
              @click="organizeMedia"
              :disabled="!canOrganize || organizing"
              :loading="organizing"
            >
              Start
            </v-btn>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-progress-linear
              :model-value="progressPercentage"
              height="25"
              color="green"
            >
            <template v-slot:default="{ value }: { value: number }">
              <strong class="black--text">{{ Math.ceil(value) }}%</strong>
            </template>
            </v-progress-linear>
            <div class="text-center mt-2">
              {{ progress.current }} / {{ progress.total }} files processed
            </div>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-card>
              <v-card-title class="text-h6">Logs</v-card-title>
              <v-card-text>
                <v-textarea
                  v-model="logsText"
                  readonly
                  auto-grow
                  rows="5"
                  row-height="15"
                  class="logs-area"
                  hide-details
                ></v-textarea>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useTheme } from 'vuetify';

interface FileTypeCount {
  images: number;
  audio: number;
  videos: number;
  documents: number;
  others: number;
}

export default defineComponent({
  name: 'App',
  setup() {
    const theme = useTheme();
    const sourcePath = ref('');
    const destPath = ref('');
    const organizing = ref(false);
    const progress = ref<{ current: number; total: number }>({ current: 0, total: 0 });
    const logs = ref<string[]>([]);
    const logsText = computed(() => logs.value.join('\n'));
    const scanning = ref(false);
    const scannedFiles = ref<string[]>([]);
    const error = ref('');

    const canScan = computed(() => sourcePath.value && destPath.value);
    const canOrganize = computed(() => canScan.value && scannedFiles.value.length > 0);
    const progressPercentage = computed(() => {
      if (progress.value.total === 0) return 0;
      return (progress.value.current / progress.value.total) * 100;
    });

    const themeIcon = computed(() => {
      return theme.global.current.value.dark ? 'mdi-weather-night' : 'mdi-weather-sunny';
    });

    const toggleTheme = () => {
      theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark';
    };

    const selectSourceFolder = async () => {
      const result = await (window as any).electronAPI.openDirectory();
      if (result) sourcePath.value = result;
    };

    const selectDestFolder = async () => {
      const result = await (window as any).electronAPI.openDirectory();
      if (result) destPath.value = result;
    };

    const scanMedia = async () => {
      scanning.value = true;
      error.value = '';
      logs.value = []; // Clear the logs before a new scan
      progress.value = { current: 0, total: 0 };

      try {
        const result = await (window as any).electronAPI.scanMedia(sourcePath.value, destPath.value);
        if (result.error) {
          error.value = result.error;
          logs.value.push(`Error: ${result.error}`);
        } else {
          scannedFiles.value = result.files;
          logs.value.push(`Scan completed. Found ${result.files.length} files.`);
          logs.value.push(`Images: ${result.typeCounts.images}`);
          logs.value.push(`Audio: ${result.typeCounts.audio}`);
          logs.value.push(`Videos: ${result.typeCounts.videos}`);
          logs.value.push(`Documents: ${result.typeCounts.documents}`);
          logs.value.push(`Others: ${result.typeCounts.others}`);
        }
      } catch (err) {
        console.error('Error scanning media:', err);
        error.value = `Error scanning media: ${err instanceof Error ? err.message : String(err)}`;
        logs.value.push(`Error: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        scanning.value = false;
      }
    };

    const organizeMedia = async () => {
      organizing.value = true;
      error.value = '';
      progress.value = { current: 0, total: scannedFiles.value.length };

      try {
        await (window as any).electronAPI.organizeMedia(sourcePath.value, destPath.value, scannedFiles.value.length);
      } catch (err) {
        console.error('Error organizing media:', err);
        error.value = `Error organizing media: ${err}`;
        logs.value.push(`Error: ${err}`);
      } finally {
        organizing.value = false;
      }
    };

    const handleProgress = (newProgress: { current: number, total: number }) => {
      progress.value = newProgress;
    };

    const handleLog = (message: string) => {
      logs.value.push(message);
    };

    onMounted(() => {
      (window as any).electronAPI.onProgress(handleProgress);
      (window as any).electronAPI.onLog(handleLog);
    });

    onUnmounted(() => {
      // Remove event listeners if necessary
    });

    // Add this watch effect to log theme changes
    watch(() => theme.global.name.value, (newTheme) => {
      console.log('Theme changed to:', newTheme);
    });

    return {
      sourcePath,
      destPath,
      organizing,
      progress,
      logs,
      logsText,
      canOrganize,
      selectSourceFolder,
      selectDestFolder,
      scanMedia,
      organizeMedia,
      theme,
      themeIcon,
      toggleTheme,
      scanning,
      scannedFiles,
      error,
      canScan,
      progressPercentage,
    };
  },
});
</script>

<style scoped>
.logs-area {
  font-family: monospace;
  font-size: 0.8rem;
  white-space: pre-wrap;
  word-wrap: break-word;
  max-height: 30vh;
  overflow-y: auto;
}

@media (max-width: 600px) {
  .v-btn {
    width: 100%;
  }

  .v-app-bar-title {
    font-size: 1.25rem !important;
  }

  .v-btn.v-btn--icon {
    width: 36px;
    height: 36px;
    min-width: 36px;
    padding: 0;
  }

  .v-app-bar .v-toolbar__content {
    justify-content: space-between;
  }
}
</style>