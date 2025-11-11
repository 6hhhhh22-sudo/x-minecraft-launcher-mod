// login.ts (modified: removed all official auth references; only offline mode; no email/password handling; default to offline)
import { useLocalStorageCacheStringValue } from '@/composables/cache'
import { AUTHORITY_DEV, AuthorityMetadata } from '@xmcl/runtime-api'
import { Ref, computed } from 'vue'
import { DialogKey } from './dialog'
import { injection } from '@/util/inject'
import { kUserContext } from './user'
import { kSettingsState } from './setting'
import { useLocalStorage } from '@vueuse/core'

export function useAccountSystemHistory() {
  // No history needed for offline only
  const authority = useLocalStorageCacheStringValue('loginLastAuthAuthority', 'offline', { legacyKey: 'last-auth-service' })
  return {
    authority,
  }
}

export interface AuthorityItem {
  icon: string
  text: string
  value: string
}

export function useAllowThirdparty() {
  const { state: setting } = injection(kSettingsState)
  const { users } = injection(kUserContext)
  const allowThirdParty = computed(() => {
    if (setting.value?.developerMode) return true
    return true // Always allow for cracked
  })
  return allowThirdParty
}

export function useAuthorityItems(authorities: Ref<AuthorityMetadata[] | undefined>) {
  const thirdParty = useAllowThirdparty()
  const { createOfflineProfile } = injection(kUserContext)
  const items: Ref<AuthorityItem[]> = computed(() => {
    const result = [] as AuthorityItem[]
    // Only offline/cracked mode available, no other authorities
    result.push({
      value: 'offline',
      text: 'Offline / Cracked Mode (Requires Key for cubecraft.net etc.)',
      icon: 'wifi_off',
    })
    if (thirdParty.value) {
      // Optional: Add dev if needed
      result.push({
        value: AUTHORITY_DEV,
        text: 'Developer Mode',
        icon: 'wifi_off',
      })
    }
    console.log('Authority items: only offline/cracked mode enabled')
    return result
  })
  const handleOfflineSelect = async (username?: string, key?: string) => {
    if (!username || !key) {
      console.warn('Username and key are required for offline mode (e.g., for CubeCraft)')
      return
    }
    try {
      await createOfflineProfile(username, key)
      console.log(`Offline profile created with key for ${username}`)
    } catch (e) {
      console.error('Failed to create offline profile:', e)
      throw e // Re-throw for UI handling
    }
  }
  return {
    items,
    handleOfflineSelect,
  }
}

export const LoginDialog: DialogKey<{ username?: string; service?: string; error?: string }> = 'login'
