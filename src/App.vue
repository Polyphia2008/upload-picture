<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { ConfigProvider } from 'ant-design-vue'
import viVN from 'ant-design-vue/es/locale/vi_VN'
import ToastHost from './components/ToastHost.vue'
const route = useRoute()
const landing = computed(() => route.name === 'landing')
</script>

<template>
  <ConfigProvider :locale="viVN" :theme="{ token: { colorPrimary: '#bd0c0c', colorInfo: '#bd0c0c', colorSuccess: '#24b47e', colorError: '#f43f5e', borderRadius: 12, fontFamily: 'Be Vietnam Pro, sans-serif' } }">
    <RouterView v-slot="{ Component }">
      <Transition :name="landing ? 'page-fade' : 'page-slide'" mode="out-in">
        <component :is="Component" :key="route.path" />
      </Transition>
    </RouterView>
    <ToastHost />
  </ConfigProvider>
</template>
