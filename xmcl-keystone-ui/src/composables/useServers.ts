import { ref, computed, readonly } from 'vue'
import { useLocalStorage } from '@vueuse/core' // npm install @vueuse/core لو مش مثبت

export interface Server {
  id: string
  name: string
  ip: string
  port: number
}

export function useServers() {
  const servers = useLocalStorage<Server[]>('xmcl-servers', [])

  const addServer = (name: string, ip: string, port: number = 25565) => {
    const id = crypto.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).substr(2)
    servers.value.push({ id, name, ip, port: Number(port) })
  }

  const removeServer = (id: string) => {
    servers.value = servers.value.filter(s => s.id !== id)
  }

  const getServer = (id: string) => servers.value.find(s => s.id === id)

  const icons = computed(() =>
    servers.value.slice(0, 5).map(s => ({ // حد أقصى 5 أيقونات في الكارد
      name: s.name,
      icon: undefined,
      color: undefined
    }))
  )

  const text = computed(() =>
    servers.value.length === 0 ? 'No servers added yet' : `${servers.value.length} servers saved`
  )

  return {
    servers: readonly(servers),
    icons,
    text,
    addServer,
    removeServer,
    getServer
  }
}
