// login.ts
import { useLocalStorageCache, useLocalStorageCacheStringValue } from '@/composables/cache'
import { AUTHORITY_DEV, AUTHORITY_MICROSOFT, AUTHORITY_MOJANG, AuthorityMetadata, YggdrasilApi } from '@xmcl/runtime-api'
import { Ref, computed } from 'vue'
import { DialogKey } from './dialog'
import { injection } from '@/util/inject'
import { kUserContext } from './user'
import { kSettingsState } from './setting'
import { useLocalStorage } from '@vueuse/core'

export function useAccountSystemHistory() {
  const authority = useLocalStorageCacheStringValue('loginLastAuthAuthority', AUTHORITY_MICROSOFT as string, { legacyKey: 'last-auth-service' })
  const allHistoryRaw = useLocalStorage('loginAuthorityHistory', () => ([] as { name: string; authority: string }[]))
  const history = computed({
    get: () => allHistoryRaw.value.filter(v => v.authority === authority.value).map(v => v.name),
    set: (v) => {
      allHistoryRaw.value = [
        ...allHistoryRaw.value.filter(v => v.authority !== authority.value),
        ...v.map(x => ({ name: x, authority: authority.value })),
      ]
    },
  })
  return {
    authority,
    history,
  }
}

export interface AuthorityItem {
  icon: string
  text: string
  value: string
}

const strictLocales = [
  'de-DE', 'en-GB', 'fr-FR', 'es-ES', 'it-IT', 'pt-PT', 'nl-NL', 'sv-SE', 'da-DK', 'fi-FI', 'no-NO', 'el-GR', 'tr-TR', 'is-IS', 'en-IE', 'el-CY', 'en-AU', 'en-US', 'en-CA', 'ja-JP', 'ko-KR',
]

export function useAllowThirdparty() {
  const { state: setting } = injection(kSettingsState)
  const { users } = injection(kUserContext)
  const allowThirdParty = computed(() => {
    if (users.value.some(u => u.authority === AUTHORITY_MICROSOFT)) return true
    if (setting.value?.developerMode) return true
    const locale = (new Intl.NumberFormat()).resolvedOptions().locale
    if (strictLocales.includes(locale)) return false
    return true
  })
  return allowThirdParty
}

export function useAuthorityItems(authorities: Ref<AuthorityMetadata[] | undefined>) {
  const thirdParty = useAllowThirdparty()
  const { createOfflineProfile } = injection(kUserContext)

  const items: Ref<AuthorityItem[]> = computed(() => {
    if (!authorities.value) return []
    const result = [] as AuthorityItem[]
    // Offline as first option, always (to support cracked servers like CubeCraft)
    result.push({
      value: 'offline',
      text: 'Offline / Cracked Mode (Login without account, like cubecraft.net)',
      icon: 'wifi_off',
    })
    for (const v of authorities.value) {
      if (!thirdParty.value && v.authority !== AUTHORITY_MICROSOFT) continue
      if (v.authority === AUTHORITY_MICROSOFT) {
        result.push({
          value: AUTHORITY_MICROSOFT,
          text: 'Microsoft Account',
          icon: 'gavel',
        })
      }
      if (v.authority === AUTHORITY_DEV) {
        result.push({
          value: AUTHORITY_DEV,
          text: 'Developer Mode',
          icon: 'wifi_off',
        })
      }
      result.push({
        value: v.authority,
        text: v.authlibInjector?.meta.serverName ?? new URL(v.authority).host,
        icon: v.favicon ?? '',
      })
    }
    console.log('Authority items loaded with offline for cracked servers:', result)
    return result
  })

  const handleOfflineSelect = (username?: string) => {
    if (!username) {
      console.warn('Username is required for offline mode (e.g., for CubeCraft)')
      return
    }
    createOfflineProfile(username)
    console.log(`Offline `)
  }

  return {
    items,
    handleOfflineSelect,
  }
}

export const LoginDialog: DialogKey<{ username?: string; service?: string; error?: string }> = 'login'
