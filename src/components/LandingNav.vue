<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()
const active = computed(() => route.name === 'landing' ? 'Home' : '')
const links = [{ name: 'Home', to: '/' }, { name: 'Providers', to: '/models' }, { name: 'Docs', to: '/docs' }, { name: 'Terms', to: '/terms' }, { name: 'Free', to: '/pricing' }]
</script>
<template>
  <nav class="ws-landing-nav-capsule" aria-label="Navigation">
    <div class="ws-landing-nav-linear-border" aria-hidden="true" />
    <div class="ws-landing-nav-menu">
      <div v-for="link in links" :key="link.name" class="ws-landing-nav-item-wrap">
        <RouterLink :to="link.to" class="ws-landing-nav-link" :class="{ 'is-active': active === link.name }">
          <svg class="ws-landing-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path v-if="link.name === 'Home'" d="m3 11 9-8 9 8v9a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z" />
            <path v-else-if="link.name === 'Providers'" d="m12 2 9 5-9 5-9-5Zm-9 10 9 5 9-5M3 17l9 5 9-5" />
            <path v-else-if="link.name === 'Docs'" d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2ZM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7Z" />
            <path v-else-if="link.name === 'Terms'" d="M19 17V5a2 2 0 0 0-2-2H4M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4M15 8h-5m5 4h-5" />
            <path v-else d="M20 12v8H4v-8M2 7h20v5H2ZM12 22V7m0 0H7.5a2.5 2.5 0 1 1 0-5C11 2 12 7 12 7Zm0 0h4.5a2.5 2.5 0 1 0 0-5C13 2 12 7 12 7Z" />
          </svg>
          <span class="ws-landing-nav-text">{{ link.name }}</span>
        </RouterLink>
      </div>
    </div>
  </nav>
</template>
