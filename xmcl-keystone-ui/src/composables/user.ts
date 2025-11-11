// user.ts (modified: added SocketIO client to listen for key_invalidated; on invalidate, show toast, remove profile, send offline status)
import { computed, del, InjectionKey, reactive, Ref, set, toRefs, watch, ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { GameProfileAndTexture, UserProfile, UserServiceKey, UserState } from '@xmcl/runtime-api'
import { useService } from '@/composables'
import { useLocalStorageCacheStringValue } from './cache'
import { useState } from './syncableState'
import { GameProfile } from '@xmcl/user'
import { useLocalStorage } from '@vueuse/core'
import io from 'socket.io-client'

const NO_USER_PROFILE: UserProfile = Object.freeze({
  selectedProfile: '',
  invalidated: true,
  authority: '',
  profileService: '',
  profiles: {},
  id: '',
  username: '',
  expiredAt: -1,
})
const NO_GAME_PROFILE: GameProfileAndTexture = Object.freeze({
  id: '',
  name: '',
  textures: { SKIN: { url: '' } },
})

export const kUserContext: InjectionKey<ReturnType<typeof useUserContext>> = Symbol('UserContext')

export function useUserContext() {
  const { getUserState, refreshUser } = useService(UserServiceKey)
  const { state, isValidating, error } = useState(getUserState, class extends UserState {
    override gameProfileUpdate({ profile, userId }: { userId: string; profile: (GameProfileAndTexture | GameProfile) }) {
      const userProfile = this.users[userId]
      if (profile.id in userProfile.profiles) {
        const instance = { textures: { SKIN: { url: '' } }, ...profile }
        set(userProfile.profiles, profile.id, instance)
      } else {
        userProfile.profiles[profile.id] = {
          textures: { SKIN: { url: '' } },
          ...profile,
        }
      }
    }
    override userProfileRemove(userId: string) {
      del(this.users, userId)
    }
    override userProfile(user: UserProfile) {
      if (this.users[user.id]) {
        const current = this.users[user.id]
        current.avatar = user.avatar
        current.expiredAt = user.expiredAt
        current.profiles = user.profiles
        current.username = user.username
        current.selectedProfile = user.selectedProfile
        current.invalidated = user.invalidated
      } else {
        set(this.users, user.id, user)
      }
    }
  })
  const selectedUserId = useLocalStorageCacheStringValue('selectedUserId', '' as string)
  const userProfile: Ref<UserProfile> = computed(() => state.value?.users[selectedUserId.value] ?? NO_USER_PROFILE)
  const gameProfile: Ref<GameProfileAndTexture> = computed(() => userProfile.value.profiles[userProfile.value.selectedProfile] ?? NO_GAME_PROFILE)
  const users = computed(() => Object.values(state.value?.users || {}))
  const select = (id: string) => {
    selectedUserId.value = id
  }
  // Create offline profile for cracked servers like CubeCraft, requires key validation and association
  const createOfflineProfile = async (username: string = 'Player' + Math.floor(Math.random() * 10000), key: string = '') => {
    if (!key) {
      throw new Error('Key is required for offline cracked mode')
    }
    // Validate key against server
    const validateResponse = await fetch(`http://localhost:5000/validate/${encodeURIComponent(key)}`)
    const validateData = await validateResponse.json()
    if (!validateData.valid || !validateData.active) {
      throw new Error(`Invalid or inactive key: ${validateData.associated_username || 'No association'}`)
    }
    let finalUsername = username
    // If associated username exists, use it (but allow override/change by updating association)
    if (validateData.associated_username && validateData.associated_username !== username) {
      // Update to new username (allows change)
      console.log(`Updating associated username from ${validateData.associated_username} to ${username}`)
      const associateResponse = await fetch(`http://localhost:5000/associate_username/${encodeURIComponent(key)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      })
      const associateData = await associateResponse.json()
      if (!associateData.success) {
        throw new Error(`Failed to associate username: ${associateData.error}`)
      }
    } else if (!validateData.associated_username) {
      // Associate new username
      const associateResponse = await fetch(`http://localhost:5000/associate_username/${encodeURIComponent(key)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      })
      const associateData = await associateResponse.json()
      if (!associateData.success) {
        throw new Error(`Failed to associate username: ${associateData.error}`)
      }
    }
    const offlineId = uuidv4() // Random UUID for offline
    const newProfile: UserProfile = {
      id: offlineId,
      username: finalUsername,
      authority: 'offline',
      selectedProfile: offlineId,
      invalidated: false,
      expiredAt: Date.now() + 365 * 24 * 60 * 60 * 1000, // Valid for one year
      profiles: {
        [offlineId]: {
          id: offlineId,
          name: finalUsername,
          textures: { SKIN: { url: '' } },
        },
      },
      profileService: '',
    }
    if (state.value) {
      set(state.value.users, offlineId, newProfile)
    }
    select(offlineId)
    refreshUser(offlineId)
    // Save the username to localStorage for persistence across app restarts
    // Keep a history of up to 5 recent usernames for offline mode
    const offlineHistory = useLocalStorage<{ usernames: string[] }>('offlineUsernamesHistory', { usernames: [] })
    if (!offlineHistory.value.usernames.includes(finalUsername)) {
      offlineHistory.value.usernames.unshift(finalUsername)
      if (offlineHistory.value.usernames.length > 5) {
        offlineHistory.value.usernames = offlineHistory.value.usernames.slice(0, 5)
      }
    }
    // Also save the last used offline username for default prefill
    localStorage.setItem('lastOfflineUsername', finalUsername)
    // Save the key locally for future validations (per user/session)
    localStorage.setItem(`offlineKey_${offlineId}`, key)
    // Subscribe to key room for real-time invalidation
    const socket = io('http://localhost:5000')
    socket.emit('subscribe_key', { key })
    socket.on('key_invalidated', async (data) => {
      const { key: invalidKey, reason } = data
      if (invalidKey === key) {
        // Show styled tooltip/toast message
        showInvalidationToast(reason)
        // Remove profile
        del(state.value.users, offlineId)
        // Send offline status
        await sendStatusToServer(finalUsername, key, 'offline')
        // Clear local storage
        localStorage.removeItem(`offlineKey_${offlineId}`)
        // Select no user or first available
        selectedUserId.value = ''
        console.log(`Key invalidated: ${reason}. Profile removed.`)
      }
    })
    // Send online status to server
    await sendStatusToServer(finalUsername, key, 'online')
    console.log(`Offline profile created for ${finalUsername} with ID: ${offlineId} using key: ${key} – Ready for CubeCraft`)
    return newProfile
  }
  // Function to show styled toast (using Vuetify snackbar or custom)
  const showInvalidationToast = (reason: string) => {
    // Assuming Vuetify is used; show a snackbar with app style
    // You can integrate with existing toast system, e.g., useSnackbar from Vuetify
    const snackbar = {
      color: 'error',
      timeout: 5000,
      show: true,
      message: `Your key has been ${reason}. Please contact support or get a new key.`,
      location: 'top',
      transition: 'slide-y-transition'
    }
    // Emit event to parent or use global store to show snackbar
    // For example: bus.$emit('show-snackbar', snackbar)
    console.log(`Toast: Your key has been ${reason}. Please contact support or get a new key.`) // Placeholder
  }
  // New: Function to send status update to server
  const sendStatusToServer = async (username: string, key: string, status: 'online' | 'offline') => {
    try {
      await fetch(`http://localhost:5000/update_status/${encodeURIComponent(key)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, status })
      })
      console.log(`Status updated to ${status} for ${username}`)
    } catch (e) {
      console.error('Failed to update status:', e)
    }
  }
  // New: Call onLogout to send offline status (e.g., on app close or profile remove)
  const onLogout = async (key: string) => {
    const username = userProfile.value.username
    await sendStatusToServer(username, key, 'offline')
  }
  watch(userProfile, (profile) => {
    if (profile === NO_USER_PROFILE) {
      const first = users.value[0]
      if (first) {
        select(first.id)
      }
    } else {
      refreshUser(profile.id)
    }
  }, { immediate: true })
  watch(users, (usersList) => {
    if (usersList.length === 0) {
      // Load last offline username if available, otherwise create default
      const lastUsername = localStorage.getItem('lastOfflineUsername') || 'PlayerDefault'
      // Note: Key is required, so this won't auto-create without key – handled in UI
      console.log('No users, waiting for offline profile with key')
    }
  }, { immediate: true })
  watch(state, (s) => {
    if (!s) return
    if (userProfile.value === NO_USER_PROFILE) {
      const first = users.value[0]
      if (first) {
        select(first.id)
      }
    }
  })
  return {
    users,
    isValidating,
    error,
    select,
    userProfile,
    gameProfile,
    createOfflineProfile,
    onLogout,
  }
}

export function useUserExpired(user: Ref<UserProfile | undefined>) {
  return computed(() => !user.value || user.value?.invalidated || user.value.expiredAt < Date.now())
}

// Simplified to username only, no email or password
export function useLoginValidation() {
  const nameRules = [(v: unknown) => !!v || 'Username is required']
  return {
    usernameRules: nameRules,
  }
}
