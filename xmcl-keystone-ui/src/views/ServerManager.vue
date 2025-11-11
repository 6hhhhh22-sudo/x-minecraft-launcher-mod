<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card-title class="headline">Server Manager</v-card-title>
        <v-btn @click="showAddDialog = true" color="primary" class="mb-4">
          <v-icon left>add</v-icon>
          Add Server
        </v-btn>
      </v-col>
    </v-row>

    <v-row v-if="instances.length > 0">
      <v-col cols="12">
        <v-select
          v-model="selectedInstance"
          :items="instances"
          item-title="name"
          item-value="path"
          label="Select Instance to Launch"
          persistent-hint
          prepend-inner-icon="mdi-cube"
          @update:model-value="onInstanceSelect"
        />
      </v-col>
    </v-row>

    <v-row v-else>
      <v-col cols="12">
        <v-alert type="warning">
          No instances available. Create one first!
        </v-alert>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-list two-line subheader>
          <v-subheader>Added Servers</v-subheader>
          <v-list-item v-for="server in servers" :key="server.id" class="pa-2">
            <v-list-item-avatar>
              <v-avatar color="primary" size="40">
                {{ server.name.charAt(0).toUpperCase() }}
              </v-avatar>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title class="headline">{{ server.name }}</v-list-item-title>
              <v-list-item-subtitle>{{ server.ip }}:{{ server.port }}</v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-btn
                icon
                small
                color="success"
                @click="joinServer(server)"
                :disabled="!selectedInstance"
                :title="selectedInstance ? 'Join Server' : 'Select Instance First'"
              >
                <v-icon>mdi-play</v-icon>
              </v-btn>
            </v-list-item-action>
            <v-list-item-action>
              <v-btn icon small color="error" @click="removeServer(server.id)">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
          <v-divider v-if="servers.length === 0" class="my-4" />
          <v-list-item v-if="servers.length === 0" disabled class="text-center">
            <v-list-item-content>
              <v-list-item-title>No servers added yet.</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-col>
    </v-row>

    <!-- Add Server Dialog -->
    <v-dialog v-model="showAddDialog" persistent max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">Add New Server</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="newServerName"
                  label="Server Name *"
                  required
                  :rules="[v => !!v || 'Name is required']"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="newServerIP"
                  label="IP Address *"
                  placeholder="e.g., play.hypixel.net"
                  required
                  :rules="[v => !!v || 'IP is required', v => /.+/.test(v) || 'Valid IP or domain required']"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model.number="newServerPort"
                  label="Port"
                  type="number"
                  min="1"
                  max="65535"
                  :rules="[v => (v >= 1 && v <= 65535) || 'Port must be between 1-65535']"
                  hint="Default: 25565"
                />
              </v-col>
            </v-row>
          </v-container>
          <small>* indicates required fields</small>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="blue darken-1" text @click="showAddDialog = false">
            Cancel
          </v-btn>
          <v-btn color="blue darken-2" text @click="addNewServer" :disabled="!isValidForm">
            Add Server
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router' // أو من composables/router
import { useI18n } from '@/composables/i18n' // افترض موجود
import { LaunchService } from '@xmcl/runtime/launch' // استورد من الـ runtime
import { kInstance } from '@/composables/instance' // للإنستانسات
import { useServers, type Server } from '@/composables/useServers'
import type { Instance } from '@/types/instance' // افترض type موجود

const { t } = useI18n()
const router = useRouter()
const { instance } = inject(kInstance) // أو InstanceService
const launchService = inject<LaunchService>('LaunchService') // غير حسب الـ inject الحقيقي
const { servers, addServer: addFromComposable, removeServer } = useServers()

const instances = ref<Instance[]>([]) // load instances
const selectedInstance = ref<string | null>(null)
const showAddDialog = ref(false)
const newServerName = ref('')
const newServerIP = ref('')
const newServerPort = ref(25565)

const isValidForm = computed(() => !!newServerName.value && !!newServerIP.value)

onMounted(async () => {
  // Load instances from service، غير حسب الـ API الحقيقي
  if (instance.value) {
    instances.value = [instance.value] // أو await instanceService.getAll()
  }
})

const onInstanceSelect = (path: string) => {
  selectedInstance.value = path
}

const joinServer = async (server: Server) => {
  if (!selectedInstance.value) {
    // استخدم dialog أو alert
    console.warn('No instance selected!')
    return
  }
  const options = {
    instancePath: selectedInstance.value, // غير حسب الـ launch options
    extraArgs: [`--server ${server.ip}:${server.port}`]
  }
  try {
    await launchService?.launch(options)
    // optional: hide window أو شيء
  } catch (e) {
    console.error('Launch failed:', e)
    // show error dialog
  }
}

const addNewServer = () => {
  addFromComposable(newServerName.value, newServerIP.value, newServerPort.value)
  showAddDialog.value = false
  newServerName.value = ''
  newServerIP.value = ''
  newServerPort.value = 25565
}

const removeServer = (id: string) => {
  // confirm dialog optional
  if (confirm('Remove this server?')) {
    removeServer(id)
  }
}
</script>
