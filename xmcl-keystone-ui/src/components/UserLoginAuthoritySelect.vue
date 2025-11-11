<!-- UserLoginAuthoritySelect.vue -->
<template>
  <v-card class="pa-4">
    <v-card-title>Select Login Method_MGV</v-card-title>
    <v-select
      v-model="selectedAuthority"
      :items="authorityItems.items"
      item-title="text"
      item-value="value"
      label="Method"
      variant="outlined"
      prepend-inner-icon="mdi-account-key"
      @update:model-value="onAuthorityChange"
      class="mb-4"
    />

    <v-form v-if="selectedAuthority === 'offline'" ref="offlineForm">
      <v-text-field
        v-model="offlineUsername"
        :rules="nameRules"
        label="Enter your in-game name"
        :placeholder="placeholderText"
        prepend-inner-icon="mdi-account"
        variant="outlined"
        class="mb-2"
      />
      <v-btn
        color="success"
        :disabled="!isFormValid"
        @click="handleOfflineLogin"
        block
        size="large"
      >
        Start Playing
      </v-btn>
      <v-card-subtitle class="text-caption mt-2 text-center">
        You can now join any server that supports cracked for free.
      </v-card-subtitle>
    </v-form>

    <div v-else-if="selectedAuthority === AUTHORITY_MICROSOFT">
      <p>Use Microsoft Account for full access</p>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { AUTHORITY_MICROSOFT } from '@xmcl/runtime-api'
import { useAuthorityItems } from '@/composables/login'
import { useLoginValidation } from '@/composables/user'
import { useDialog } from '@/composables/dialog'
import { useLocalStorage } from '@vueuse/core'

const emit = defineEmits<{ 'login-success': [data: { username: string; authority: string }] }>()

const selectedAuthority = ref('offline')
const offlineUsername = ref('')
const offlineForm = ref()

const authorities = ref<AuthorityMetadata[] | undefined>()
const { items: authorityItems, handleOfflineSelect } = useAuthorityItems(authorities)

// Load history of offline usernames from localStorage
const offlineHistory = useLocalStorage<{ usernames: string[] }>('offlineUsernamesHistory', { usernames: [] })
const lastOfflineUsername = localStorage.getItem('lastOfflineUsername') || 'Player' + Math.floor(Math.random() * 10000)
offlineUsername.value = lastOfflineUsername // Prefill with last used username

const placeholderText = computed(() => {
  if (offlineHistory.value.usernames.length > 0) {
    return `Example: ${offlineHistory.value.usernames[0]} (or try one from history: ${offlineHistory.value.usernames.slice(0, 3).join(', ')})`
  }
  return 'Example: Steve123 This will be your name'
})

const emailOnly = ref(false)
const { usernameRules: nameRules } = useLoginValidation(emailOnly)

const isFormValid = computed(() => offlineUsername.value && offlineForm.value?.validate())

const onAuthorityChange = (value: string) => {
  selectedAuthority.value = value
  console.log(`Selected: ${value}`)
}

const handleOfflineLogin = async () => {
  if (!isFormValid.value) {
    console.warn('Form is not valid')
    return
  }
  try {
    handleOfflineSelect(offlineUsername.value)
    emit('login-success', { username: offlineUsername.value, authority: 'offline' })
    const { closeDialog } = useDialog()
    closeDialog()
    console.log('Offline login successful – ready for cracked servers like CubeCraft!')
  } catch (e) {
    console.error('Error in offline login:', e)
  }
}

onMounted(() => {
  console.log('UserLoginAuthoritySelect mounted – offline mode ready for CubeCraft with persisted username')
})
</script>
