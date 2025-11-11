<template>
  <v-dialog v-model="internalShow" persistent max-width="500px">
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
                :rules="[v => !!v || 'IP is required']"
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model.number="newServerPort"
                label="Port"
                type="number"
                min="1"
                max="65535"
                hint="Default: 25565"
                :rules="[v => v && v >= 1 && v <= 65535 || 'Valid port required']"
              />
            </v-col>
          </v-row>
        </v-container>
        <small>* indicates required fields</small>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="blue darken-1" text @click="closeDialog">
          Cancel
        </v-btn>
        <v-btn color="blue darken-2" text @click="addServer" :disabled="!isValidForm">
          Add
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { useServers } from '@/composables/useServers'
import type { ServerAddDialogProps } from './types' // optional type

const props = defineProps<ServerAddDialogProps>()
const emit = defineEmits(['added', 'close'])

const { addServer } = useServers()
const internalShow = ref(false)
const newServerName = ref('')
const newServerIP = ref('')
const newServerPort = ref(25565)

const isValidForm = computed(() => !!newServerName.value && !!newServerIP.value)

watch(() => props.show, (val) => {
  internalShow.value = val
  if (!val) {
    resetForm()
  }
})

const closeDialog = () => {
  internalShow.value = false
  emit('close')
}

const resetForm = () => {
  newServerName.value = ''
  newServerIP.value = ''
  newServerPort.value = 25565
}

const addServerLocal = () => {
  addServer(newServerName.value, newServerIP.value, newServerPort.value)
  emit('added')
  closeDialog()
}
</script>

<style scoped>
/* أي ستايل إضافي لو عايز */
</style>
