// user.ts
import { computed, del, InjectionKey, reactive, Ref, set, toRefs, watch, ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { GameProfileAndTexture, OfficialUserServiceKey, UserProfile, UserServiceKey, UserState } from '@xmcl/runtime-api'
import { useService } from '@/composables'
import { useLocalStorageCacheStringValue } from './cache'
import { useState } from './syncableState'
import { GameProfile } from '@xmcl/user'
import { useLocalStorage } from '@vueuse/core'

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

  // Create offline profile for cracked servers like CubeCraft
  const createOfflineProfile = (username: string = 'Player' + Math.floor(Math.random() * 10000)) => {
    const offlineId = uuidv4() // Random UUID for offline
    const newProfile: UserProfile = {
      id: offlineId,
      username,
      authority: 'offline',
      selectedProfile: offlineId,
      invalidated: false,
      expiredAt: Date.now() + 365 * 24 * 60 * 60 * 1000, // Valid for one year
      profiles: {
        [offlineId]: {
          id: offlineId,
          name: username,
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
    if (!offlineHistory.value.usernames.includes(username)) {
      offlineHistory.value.usernames.unshift(username)
      if (offlineHistory.value.usernames.length > 5) {
        offlineHistory.value.usernames = offlineHistory.value.usernames.slice(0, 5)
      }
    }
    // Also save the last used offline username for default prefill
    localStorage.setItem('lastOfflineUsername', username)

    console.log(`Offline profile created for ${username} with ID: ${offlineId} – Ready for CubeCraft`)
    return newProfile
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
      createOfflineProfile(lastUsername)
      console.log('Offline profile created automatically with last used username!')
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
  }
}

export function useUserExpired(user: Ref<UserProfile | undefined>) {
  return computed(() => !user.value || user.value?.invalidated || user.value.expiredAt < Date.now())
}

export function useLoginValidation(emailOnly: Ref<boolean>) {
  const nameRules = [(v: unknown) => !!v || 'Username is required']
  const emailRules = [
    (v: unknown) => !!v || 'Email is required',
    (v: string) => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,6})+$/.test(v) ||
      'Invalid email address',
  ]
  const passwordRules = [(v: unknown) => !!v || 'Password is required']
  const usernameRules = computed(() => emailOnly.value ? emailRules : nameRules)
  return {
    usernameRules,
    passwordRules,
  }
}

export function useMojangSecurityStatus() {
  const security = computed(() => true)
  return {
    security,
    refreshing: ref(false),
  }
}

export function useMojangSecurity(profile: Ref<UserProfile>) {
  interface MojangChallenge {
    readonly answer: {
      id: number
      answer: string
    }
    readonly question: {
      id: number
      question: string
    }
  }
  const { security, refreshing } = useMojangSecurityStatus()
  const { getSecurityChallenges: getChallenges, verifySecurityLocation: checkLocation, submitSecurityChallenges: submitChallenges } = useService(OfficialUserServiceKey)
  const data = reactive({
    loading: false,
    challenges: [] as MojangChallenge[],
    error: undefined as any,
  })
  async function check() {
    try {
      if (data.loading) return
      if (data.challenges.length > 0) return
      data.loading = true
      const sec = await checkLocation(profile.value)
      if (sec) return
      try {
        const challenges = await getChallenges(profile.value)
        data.challenges = challenges.map(c => ({ question: c.question, answer: { id: c.answer.id, answer: '' } }))
      } catch (e) {
        data.error = e
      }
    } finally {
      data.loading = false
    }
  }
  async function submit() {
    data.loading = true
    try {
      await submitChallenges(profile.value, data.challenges.map(c => c.answer))
    } catch (e) {
      data.error = e
    } finally {
      data.loading = false
    }
  }
  return {
    ...toRefs(data),
    refreshing,
    security,
    check,
    submit,
  }
}
