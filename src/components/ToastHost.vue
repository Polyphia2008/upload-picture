<script setup lang="ts">
import { animate } from 'animejs'
import { CheckOutlined, CloseCircleOutlined, CloseOutlined, InfoCircleOutlined, LoadingOutlined, WarningOutlined } from '@ant-design/icons-vue'
import { useToastState, Wstoast, type ToastType } from '../services/toast'
const state = useToastState()
const icons: Record<ToastType, unknown> = { info: InfoCircleOutlined, success: CheckOutlined, warning: WarningOutlined, error: CloseCircleOutlined, loading: LoadingOutlined }
const animations = new WeakMap<Element, ReturnType<typeof animate>>()

function enter(element: Element, done: () => void) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  animate(element, { opacity: [0, 1], translateY: reduced ? 0 : [-22, 0], scale: reduced ? 1 : [.9, 1.025, 1], duration: reduced ? 1 : 520, ease: 'out(4)', onComplete: done })
  const icon = element.querySelector('.ws-toast__icon')
  if (icon) animate(icon, { scale: [0, 1.18, 1], rotate: ['-18deg', '5deg', '0deg'], duration: reduced ? 1 : 560, ease: 'outBack' })
  const progress = element.querySelector('.ws-toast__progress')
  const item = state.items.find((toast) => String(toast.id) === element.getAttribute('data-toast-id'))
  if (progress && item && item.timeout > 0) {
    const animation = animate(progress, { scaleX: [1, 0], duration: item.timeout, ease: 'linear', autoplay: true })
    animations.set(element, animation)
  }
}
function leave(element: Element, done: () => void) {
  animations.get(element)?.pause()
  animate(element, { opacity: [1, 0], translateY: [0, -14], scale: [1, .94], duration: 260, ease: 'inQuad', onComplete: done })
}
function pause(id: number, event: MouseEvent) {
  Wstoast.pause(id)
  const element = (event.currentTarget as HTMLElement)
  const progress = element.querySelector('.ws-toast__progress')
  if (progress) animations.get(element)?.pause()
}
function resume(id: number, event: MouseEvent) {
  Wstoast.resume(id)
  const element = (event.currentTarget as HTMLElement)
  const progress = element.querySelector('.ws-toast__progress')
  if (progress) animations.get(element)?.play()
}
</script>

<template>
  <TransitionGroup :css="false" tag="div" class="ws-toast-wrapper" aria-live="polite" aria-atomic="false" @enter="enter" @leave="leave">
    <article v-for="item in state.items" :key="item.id" :data-toast-id="item.id" class="ws-toast" :class="`ws-toast--${item.type}`" role="status" @mouseenter="pause(item.id, $event)" @mouseleave="resume(item.id, $event)">
      <span class="ws-toast__accent" />
      <span class="ws-toast__icon" :class="{ 'ws-toast__icon--loading': item.type === 'loading' }"><component :is="icons[item.type]" /></span>
      <span class="ws-toast__message">{{ item.content }}</span>
      <span v-if="item.count > 1" class="ws-toast__count">{{ item.count }}</span>
      <button type="button" class="ws-toast__close" aria-label="Đóng thông báo" @click="Wstoast.close(item.id)"><CloseOutlined /></button>
      <span v-if="item.timeout > 0" class="ws-toast__progress" />
    </article>
  </TransitionGroup>
</template>

<style>
.ws-toast-wrapper { position:fixed; top:max(20px,env(safe-area-inset-top)); left:50%; z-index:10000; display:flex; width:min(440px,calc(100vw - 28px)); transform:translateX(-50%); flex-direction:column; align-items:center; gap:10px; pointer-events:none; }
.ws-toast { --toast:#64748b; --rgb:100,116,139; position:relative; display:flex; width:max-content; max-width:100%; min-width:240px; min-height:54px; align-items:center; gap:11px; overflow:hidden; padding:12px 42px 12px 15px; border:1px solid rgba(255,255,255,.86); border-radius:16px; color:#293044; background:rgba(255,255,255,.88); box-shadow:0 18px 50px -18px rgba(var(--rgb),.45),0 5px 18px rgba(15,23,42,.09),inset 0 1px #fff; backdrop-filter:blur(22px) saturate(150%); font-size:13px; font-weight:550; line-height:1.5; pointer-events:auto; will-change:transform,opacity; }
.ws-toast--success { --toast:#10b981; --rgb:16,185,129; }
.ws-toast--error { --toast:#f43f5e; --rgb:244,63,94; }
.ws-toast--warning { --toast:#f59e0b; --rgb:245,158,11; }
.ws-toast--loading { --toast:#bd0c0c; --rgb:189,12,12; }
.ws-toast__accent { position:absolute; inset:0 auto 0 0; width:4px; background:linear-gradient(var(--toast),color-mix(in srgb,var(--toast) 55%,white)); }
.ws-toast__icon { display:grid; width:31px; height:31px; flex:0 0 31px; place-items:center; border-radius:10px; color:var(--toast); background:rgba(var(--rgb),.12); box-shadow:inset 0 0 0 1px rgba(var(--rgb),.1); font-size:16px; }
.ws-toast__icon--loading { animation:toast-spin 1s linear infinite; }
.ws-toast__message { min-width:0; overflow-wrap:anywhere; }
.ws-toast__count { display:grid; min-width:20px; height:20px; place-items:center; border-radius:999px; color:white; background:var(--toast); font-size:10px; }
.ws-toast__close { position:absolute; top:9px; right:9px; display:grid; width:27px; height:27px; cursor:pointer; place-items:center; border:0; border-radius:8px; color:#94a3b8; background:transparent; font-size:11px; transition:color .2s,background .2s,transform .2s; }
.ws-toast__close:hover { color:#334155; background:#f1f5f9; transform:rotate(90deg); }
.ws-toast__progress { position:absolute; right:0; bottom:0; left:0; height:3px; background:linear-gradient(90deg,var(--toast),color-mix(in srgb,var(--toast) 45%,white)); transform-origin:left; }
@keyframes toast-spin { to { transform:rotate(360deg); } }
@media(max-width:560px) { .ws-toast-wrapper { top:max(12px,env(safe-area-inset-top)); } .ws-toast { width:100%; min-width:0; min-height:52px; border-radius:15px; font-size:12px; } }
@media(prefers-reduced-motion:reduce) { .ws-toast__icon--loading { animation-duration:2s; } }
</style>
