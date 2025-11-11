<template>
  <HomeCard
    icon="public"
    :title="t('servers.title') || 'IP Join Server'"
    :class="{ dragover }"
    :text="dragover ? t('servers.dropHint') || 'Drop server link' : t('servers.count', { count: servers.length }) || `${servers.length} Servers`"
    :icons="icons"
    :refreshing="pingingAll"
    :addition-button="noAction ? undefined : {
      icon: 'add',
      text: t('servers.add') || 'Add Server'
    }"
    :button="noAction || servers.length === 0 ? undefined : {
      text: t('servers.manage') || 'Manage',
      icon: 'settings'
    }"
    :error="error"
    @navigate="push('/servers')"
    @navigate-addition="showAddDialog"
    @drop="onDrop"
  >
    <v-card-text v-if="!noAction" class="pa-0">
      <div class="flex justify-between items-center mb-2 px-2">
        <v-select
          v-model="globalSelectedVersion"
          :items="availableVersions"
          dense
          hide-details
          label="Version"
          style="max-width: 150px;"
          multiple
          chips
          clearable
        ></v-select>
        <v-btn icon small :loading="pingingAll" @click="refreshAll" color="primary">
          <v-icon>refresh</v-icon>
        </v-btn>
      </div>
      <v-list dense class="max-h-96 overflow-auto">
        <v-list-item v-for="s in servers" :key="s.id" class="pa-2">
          <v-list-item-avatar>
            <img
              v-if="statuses[s.id]?.status?.value?.favicon"
              :src="`data:image/png;base64,${statuses[s.id].status.value.favicon}`"
              class="rounded"
              width="32"
              height="32"
              @error="() => {}"
            />
            <v-icon v-else>public</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>{{ s.name }}</v-list-item-title>
            <v-list-item-subtitle class="flex items-center gap-2 text-caption">
              {{ s.ip }}:{{ s.port }}
              <v-chip v-if="statuses[s.id]" small :color="statuses[s.id].status.value.ping > 0 ? 'success' : 'error'">
                <v-icon left small>{{ statuses[s.id].pinging.value ? 'autorenew' : 'signal_cellular_alt' }}</v-icon>
                {{ statuses[s.id].status.value.ping }}ms
              </v-chip>
              <v-chip v-if="statuses[s.id]?.status?.value?.players" small outlined>
                {{ statuses[s.id].status.value.players.online }}/{{ statuses[s.id].status.value.players.max }}
              </v-chip>
            </v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action class="flex-row gap-1">
            <v-btn icon small color="primary" :disabled="!globalSelectedVersion.length" @click="joinServer(s)" :loading="launching[s.id]">
              <v-icon>play_arrow</v-icon>
            </v-btn>
            <v-btn icon small color="error" @click="removeServer(s.id)">
              <v-icon>delete</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
      </v-list>
      <v-alert v-if="error" type="error" dense class="mx-2 mt-2 text-caption">
        {{ error }}
      </v-alert>
    </v-card-text>
  </HomeCard>
</template>

<script lang="ts" setup>
import { kInstanceLaunch } from '@/composables/instanceLaunch'
import { useServers } from '@/composables/serverList'
import { useServerStatus } from '@/composables/servers'
import { injection } from '@/util/inject'
import HomeCard from '@/components/HomeCard.vue'
import { kDropHandler } from '@/composables/dropHandler'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { VersionServiceKey } from '@xmcl/runtime-api'
import { useService } from '@/composables'
import { Server } from '@/entities/server'
import { computed, nextTick, onMounted, ref, watch } from 'vue'

const props = defineProps<{ row: number; rowCount: number; noAction?: boolean }>()

const { servers, add, remove } = useServers()
const { launch: launchGame } = injection(kInstanceLaunch)
const { push } = useRouter()
const { t } = useI18n()
const { dragover } = injection(kDropHandler)

const { getInstalledVersions } = useService(VersionServiceKey)
const availableVersions = ref<string[]>([])
const globalSelectedVersion = ref<string[]>([])

onMounted(async () => {
  availableVersions.value = (await getInstalledVersions())?.map(v => v.id) || []
})

const launching = ref<Record<string, boolean>>({})
const error = ref<string | undefined>()
const pingingAll = ref(false)
const statuses = ref<Record<string, ReturnType<typeof useServerStatus>>>({})

const serverRefs = ref<Record<string, { host: string; port: number }>>({})

watch(servers, (newServers) => {
  newServers.forEach(s => {
    if (!serverRefs.value[s.id]) {
      serverRefs.value[s.id] = { host: s.ip, port: s.port }
    }
  })
}, { immediate: true })

watch(serverRefs, () => {
  Object.entries(serverRefs.value).forEach(([id, srv]) => {
    if (!statuses.value[id]) {
      const serverRef = computed(() => srv)
      const protocol = ref(undefined)
      const status = useServerStatus(serverRef, protocol)
      statuses.value[id] = status
      nextTick(() => status.refresh())
    }
  })
}, { immediate: true })

async function refreshAll() {
  pingingAll.value = true
  try {
    await Promise.all(Object.values(statuses.value).map(s => s.refresh()))
  } catch (e: any) {
    error.value = e.message
  } finally {
    pingingAll.value = false
  }
}

const icons = computed(() =>
  servers.value.slice(0, props.row * props.rowCount).map(s => ({
    name: s.name,
    icon: statuses.value[s.id]?.status.value?.favicon
      ? `data:image/png;base64,${statuses.value[s.id].status.value.favicon}`
      : 'public'
  }))
)

async function joinServer(server: Server) {
  if (!globalSelectedVersion.value.length) return alert(t('servers.selectVersion'))
  launching.value[server.id] = true
  try {
    await launchGame('client', {
      version: globalSelectedVersion.value[0],
      server: { ip: server.ip, port: server.port }
    })
  } catch (e: any) {
    error.value = e.message
  } finally {
    launching.value[server.id] = false
  }
}

function removeServer(id: string) {
  if (confirm(t('servers.confirmDelete'))) {
    remove(id)
    delete statuses.value[id]
    delete serverRefs.value[id]
  }
}

function showAddDialog() {
  const name = prompt(t('servers.name') || 'Server Name:')
  const ip = prompt(t('servers.ip') || 'IP:')
  const portStr = prompt(t('servers.port') || 'Port (default 25565):') || '25565'
  const port = Number(portStr)
  if (name && ip && !isNaN(port)) {
    add({ name, ip, port })
    nextTick(() => {
      const newId = servers.value[servers.value.length - 1].id
      const srv = { host: ip, port }
      serverRefs.value[newId] = srv
      const serverRef = computed(() => srv)
      const status = useServerStatus(serverRef, ref(undefined))
      statuses.value[newId] = status
      status.refresh()
    })
  }
}

function onDrop(e: DragEvent) {
  if (e.dataTransfer) {
    const url = e.dataTransfer.getData('text/uri-list')
    if (url.startsWith('minecraft://')) {
      const match = url.match(/minecraft:\/\/([^\/]+)(?::(\d+))?/)
      if (match) {
        const ip = match[1]
        const port = Number(match[2]) || 25565
        add({ name: ip, ip, port })
        nextTick(() => {
          const newId = servers.value[servers.value.length - 1].id
          const srv = { host: ip, port }
          serverRefs.value[newId] = srv
          const serverRef = computed(() => srv)
          const status = useServerStatus(serverRef, ref(undefined))
          statuses.value[newId] = status
          status.refresh()
        })
      }
    }
    e.preventDefault()
  }
}
</script>
