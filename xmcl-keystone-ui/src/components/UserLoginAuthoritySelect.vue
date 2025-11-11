<!-- UserLoginAuthoritySelect.vue (unchanged, as socket listener is in createOfflineProfile) -->
<template>
  <v-card class="pa-4">
    <v-card-title>Cracked Mode Login 0.52.7</v-card-title>
    <v-form ref="offlineForm">
      <v-text-field
        v-model="offlineKey"
        :rules="keyRules"
        label="Enter your activation key"
        placeholder="Required for cracked mode"
        prepend-inner-icon="mdi-key"
        variant="outlined"
        type="password"
        class="mb-2"
      />
      <v-text-field
        v-model="offlineUsername"
        :rules="nameRules"
        label="Enter your in-game name"
        :placeholder="placeholderText"
        prepend-inner-icon="mdi-account"
        variant="outlined"
        class="mb-2"
        :disabled="isAssociated && !allowChange"
      />
      <v-btn
        v-if="isAssociated && associatedUsername !== offlineUsername"
        color="warning"
        @click="updateAssociation"
        block
        size="small"
        class="mb-2"
      >
        Update Name (Change Association)
      </v-btn>
      <v-btn
        color="success"
        :disabled="!isFormValid"
        @click="handleOfflineLogin"
        block
        size="large"
      >
        {{ loading ? 'Validating...' : 'Start Playing' }}
      </v-btn>
      <v-card-subtitle class="text-caption mt-2 text-center" v-if="validationError">
        {{ validationError }}
      </v-card-subtitle>
      <v-card-subtitle class="text-caption mt-2 text-center">
        Key ensures one user per key. You can change your name anytime. No account registration required.
      </v-card-subtitle>
    </v-form>
  </v-card>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useAuthorityItems } from '@/composables/login'
import { useLoginValidation } from '@/composables/user'
import { useDialog } from '@/composables/dialog'
import { useLocalStorage } from '@vueuse/core'

const emit = defineEmits<{ 'login-success': [data: { username: string; authority: string }] }>()

const offlineUsername = ref('')
const offlineKey = ref('')
const offlineForm = ref()
const { handleOfflineSelect } = useAuthorityItems(ref<AuthorityMetadata[] | undefined>())

// Load history of offline usernames from localStorage
const offlineHistory = useLocalStorage<{ usernames: string[] }>('offlineUsernamesHistory', { usernames: [] })
const lastOfflineUsername = localStorage.getItem('lastOfflineUsername') || 'Player' + Math.floor(Math.random() * 10000)
offlineUsername.value = lastOfflineUsername // Prefill with last used username

// Validation state
const loading = ref(false)
const validationError = ref('')
const associatedUsername = ref('')
const isAssociated = computed(() => !!associatedUsername.value)
const allowChange = ref(true) // Allow name changes by default

const placeholderText = computed(() => {
  if (offlineHistory.value.usernames.length > 0) {
    return `Example: ${offlineHistory.value.usernames[0]} (or try one from history: ${offlineHistory.value.usernames.slice(0, 3).join(', ')})`
  }
  return 'Example: Steve123 This will be your name'
})

const { usernameRules: nameRules } = useLoginValidation()

// Simple key rule (non-empty)
const keyRules = [(v: unknown) => !!v || 'Key is required']

const isFormValid = computed(() => {
  return offlineKey.value && offlineUsername.value && offlineForm.value?.validate()
})

// Auto-validate key and load associated username when key changes
watch(offlineKey, async (newKey) => {
  if (newKey && newKey.length > 5) { // Basic length check
    loading.value = true
    validationError.value = ''
    try {
      const response = await fetch(`http://localhost:5000/validate/${encodeURIComponent(newKey)}`)
      const data = await response.json()
      if (data.valid && data.active) {
        associatedUsername.value = data.associated_username || ''
        if (data.associated_username) {
          offlineUsername.value = data.associated_username // Prefill with associated
          console.log(`Key valid, associated with: ${data.associated_username}`)
        } else {
          console.log('Key valid, no association yet')
        }
      } else {
        validationError.value = 'Invalid or inactive key. Check your key.'
        associatedUsername.value = ''
      }
    } catch (e) {
      validationError.value = 'Server connection error. Ensure app.py is running on port 5000.'
      console.error('Validation error:', e)
    }
    loading.value = false
  }
}, { immediate: false })

const updateAssociation = async () => {
  if (!offlineKey.value) return
  loading.value = true
  try {
    const response = await fetch(`http://localhost:5000/associate_username/${encodeURIComponent(offlineKey.value)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: offlineUsername.value })
    })
    const data = await response.json()
    if (data.success) {
      associatedUsername.value = offlineUsername.value
      console.log('Association updated successfully')
    } else {
      validationError.value = `Update failed: ${data.error}`
    }
  } catch (e) {
    validationError.value = 'Update error'
    console.error(e)
  }
  loading.value = false
}

const handleOfflineLogin = async () => {
  if (!isFormValid.value) {
    console.warn('Form is not valid')
    return
  }
  loading.value = true
  try {
    await handleOfflineSelect(offlineUsername.value, offlineKey.value)
    emit('login-success', { username: offlineUsername.value, authority: 'offline' })
    const { closeDialog } = useDialog()
    closeDialog()
    console.log('Offline login successful with key – ready for cracked servers like CubeCraft! No real account needed.')
  } catch (e) {
    validationError.value = `Login failed: ${e.message}`
    console.error('Error in offline login:', e)
  }
  loading.value = false
}

// Cleanup: Send offline on unmount (e.g., dialog close without login)
onUnmounted(() => {
  // Handled in createOfflineProfile socket
})

onMounted(() => {
  console.log('UserLoginAuthoritySelect mounted – cracked mode only, no email/password or real accounts')
})
</script>
