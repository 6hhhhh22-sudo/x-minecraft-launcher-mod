<template>
  <v-app
    class="h-full max-h-[100vh] overflow-hidden"
    :class="{ 'dark': isDark }"
  >
    <AppSystemBar
      no-task
      no-user
      no-debug
    />
    <div
      class="relative flex h-full overflow-auto"
    >
      <main
        class="relative inset-y-0 right-0 flex max-h-full flex-col overflow-auto"
      >
        <Multiplayer />
      </main>
    </div>
    <!-- Progress Bar for Updates -->
    <v-progress-linear
      v-if="showProgress"
      :value="progressValue"
      color="primary"
      height="4"
      absolute
      top
    ></v-progress-linear>
    <!-- Snackbar for Update Notifications -->
    <v-snackbar
      v-model="showSnackbar"
      :color="snackbarColor"
      :timeout="5000"
      top
    >
      {{ snackbarMessage }}
      <template v-slot:action="{ attrs }">
        <v-btn
          v-if="snackbarType === 'downloaded'"
          color="white"
          text
          v-bind="attrs"
          @click="restartApp"
        >
          إعادة تشغيل
        </v-btn>
      </template>
    </v-snackbar>
    <AppContextMenu />
    <AppSharedTooltip />
  </v-app>
</template>

<script lang=ts setup>
import '@/assets/common.css'
import AppSharedTooltip from '@/components/AppSharedTooltip.vue'
import { useDefaultErrorHandler } from '@/composables/errorHandler'
import { useNotifier } from '@/composables/notifier'
import { kTheme } from '@/composables/theme'
import { injection } from '@/util/inject'
import { onMounted } from 'vue'
import { ipcRenderer } from 'electron'  // للـ IPC
import AppContextMenu from '@/views/AppContextMenu.vue'
import AppSystemBar from '@/views/AppSystemBar.vue'
import Multiplayer from '@/views/Multiplayer.vue'

const { isDark } = injection(kTheme)

const { notify } = useNotifier()
useDefaultErrorHandler(notify)

// States for Updates
const showProgress = ref(false)
const progressValue = ref(0)
const showSnackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('info')
const snackbarType = ref('')

onMounted(() => {
  // Listen for update events from main process
  ipcRenderer.on('update-available', (event, data) => {
    showSnackbar.value = true
    snackbarMessage.value = data.message
    snackbarColor.value = 'info'
    snackbarType.value = 'available'
  })

  ipcRenderer.on('update-downloaded', (event, data) => {
    showSnackbar.value = true
    snackbarMessage.value = data.message
    snackbarColor.value = 'success'
    snackbarType.value = 'downloaded'
  })

  ipcRenderer.on('update-progress', (event, data) => {
    showProgress.value = true
    progressValue.value = data.percent
  })

  // Hide progress when done (optional event)
  ipcRenderer.on('update-completed', () => {
    showProgress.value = false
  })
})

const restartApp = () => {
  ipcRenderer.send('restart-update')
  showSnackbar.value = false
}
</script>

<style scoped>
.clip-head {
  clip-path: inset(0px 30px 30px 0px) !important;
  width: 64px;
  height: auto; /*to preserve the aspect ratio of t0.52.7he image*/
}
.v-input__icon--prepend {
  margin-right: 7px;
}
img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
</style>
