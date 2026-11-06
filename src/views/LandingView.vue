<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { brands, dockGroups } from '../brands'
import { copyText } from '../services/upload'
import LandingNav from '../components/LandingNav.vue'
import InteractiveGlobe from '../components/InteractiveGlobe.vue'
import '../styles/landing-reference.css'

const paths = ['/api/upload', '/upload.php', '/api/upload', '/docs']
const pathIndex = ref(0)
const origin = ref('https://wusrouter.com')
const copied = ref(false)
const notice = ref('')
const showNotice = ref(false)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const currentGroup = ref(0)
const nextGroup = ref(1)
const tearing = ref(false)
let pathTimer: ReturnType<typeof setInterval> | undefined
let dockTimer: ReturnType<typeof setInterval> | undefined
let tearTimer: ReturnType<typeof setTimeout> | undefined
let noticeTimer: ReturnType<typeof setTimeout> | undefined
let frame = 0
let cleanupBackground: (() => void) | undefined

async function copyEndpoint() {
  const value = `${origin.value}${paths[pathIndex.value]}`
  try {
    await copyText(value)
    copied.value = true
    notice.value = `Copied: ${value}`
    showNotice.value = true
    clearTimeout(noticeTimer)
    noticeTimer = setTimeout(() => { copied.value = false; showNotice.value = false }, 2000)
  } catch {
    notice.value = 'Unable to copy endpoint'
    showNotice.value = true
  }
}
function tearDock() {
  if (tearing.value) return
  nextGroup.value = (currentGroup.value + 1) % dockGroups.length
  tearing.value = true
  tearTimer = setTimeout(() => { currentGroup.value = nextGroup.value; tearing.value = false }, 880)
}
function initBackground() {
  const canvas = canvasRef.value
  const context = canvas?.getContext('2d')
  if (!canvas || !context) return
  let width = 0
  let height = 0
  let time = 0
  const resize = () => { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight }
  resize()
  window.addEventListener('resize', resize)
  const render = () => {
    time += .004
    context.clearRect(0, 0, width, height)
    context.fillStyle = '#fff'
    context.fillRect(0, 0, width, height)
    const items = [
      { x: width * .5 + Math.sin(time * .7) * width * .22, y: height * .35 + Math.cos(time * .5) * height * .18, r: Math.max(width,height) * .45, colors: ['rgba(165,180,252,.45)','rgba(99,102,241,.25)','rgba(255,255,255,0)'], stops: [0,.5,1] },
      { x: width * .45 + Math.cos(time * .6) * width * .2, y: height * .65 + Math.sin(time * .8) * height * .15, r: Math.max(width,height) * .5, colors: ['rgba(238,242,255,.55)','rgba(245,243,255,.35)','rgba(255,255,255,0)'], stops: [0,.55,1] },
      { x: width * .65 + Math.sin(time * .9) * width * .15, y: height * .48 + Math.cos(time * .7) * height * .12, r: Math.max(width,height) * .35, colors: ['rgba(139,92,246,.22)','rgba(255,255,255,0)'], stops: [0,1] }
    ]
    items.forEach((item) => {
      const gradient = context.createRadialGradient(item.x,item.y,0,item.x,item.y,item.r)
      item.colors.forEach((color,index) => gradient.addColorStop(item.stops[index],color))
      context.fillStyle = gradient
      context.fillRect(0,0,width,height)
    })
    frame = requestAnimationFrame(render)
  }
  render()
  cleanupBackground = () => window.removeEventListener('resize', resize)
}
onMounted(() => {
  origin.value = window.location.origin
  initBackground()
  pathTimer = setInterval(() => { pathIndex.value = (pathIndex.value + 1) % paths.length }, 3500)
  dockTimer = setInterval(tearDock, 5000)
})
onBeforeUnmount(() => {
  clearInterval(pathTimer); clearInterval(dockTimer); clearTimeout(tearTimer); clearTimeout(noticeTimer)
  cancelAnimationFrame(frame); cleanupBackground?.()
})
</script>

<template>
  <div class="ws-landing-page">
    <div class="ws-landing-bg-layer" aria-hidden="true"><canvas ref="canvasRef" class="ws-landing-canvas" /></div>
    <div class="ws-landing-earth-wrap"><div class="ws-landing-earth-inner"><InteractiveGlobe /></div></div>

    <header class="ws-landing-header-bar" aria-label="Header Navigation">
      <RouterLink to="/" class="ws-landing-brand-link" aria-label="Home">
        <img src="/logo.png" alt="WsUploadPicture logo" class="ws-landing-brand-logo" width="34" height="34" />
        <span class="ws-landing-brand-name">WsUploadPicture</span>
      </RouterLink>
      <LandingNav />
      <div class="ws-landing-header-actions">
        <RouterLink to="/upload" class="ws-framer-btn ws-framer-primary" aria-label="Upload Now"><div class="ws-framer-btn-squish"><div class="ws-framer-btn-main"><span class="ws-framer-btn-text">Upload Now</span><svg class="ws-framer-btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 12h14m-6-6 6 6-6 6" /></svg></div></div></RouterLink>
      </div>
    </header>

    <main class="ws-landing-hero-center">
      <div class="ws-landing-hero-box">
        <div class="ws-landing-header-badge">
          <span class="ws-landing-badge-corner-gift" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="3.5" y="9.5" width="17" height="11.5" rx="2" fill="#6366f1"/><rect x="2.5" y="6.5" width="19" height="3.5" rx="1.5" fill="#818cf8"/><rect x="10.75" y="6.5" width="2.5" height="14.5" fill="#fbbf24"/><path d="M7.5 6.5C6 6.5 5 5.2 5.8 3.8 6.5 2.5 8.2 2.8 11 6c.2.3.4.5.7.5H7.5Z" fill="#f59e0b"/><path d="M16.5 6.5c1.5 0 2.5-1.3 1.7-2.7-.7-1.3-2.4-1-5.2 2.2-.2.3-.4.5-.7.5h4.2Z" fill="#fbbf24"/></svg></span>
          <p class="ws-landing-badge-brand">Free Image Upload</p>
          <svg class="ws-landing-badge-sparkle" viewBox="0 0 50 50"><path d="M18 1 22 14 35 18 22 22 18 35 14 22 1 18 14 14Z" fill="#6366f1" transform="translate(7 7)" /></svg>
          <p class="ws-landing-badge-time">No Sign Up</p>
        </div>

        <div class="ws-landing-slogan-wrap">
          <h1 class="ws-landing-main-title">
            <span v-for="(word,index) in ['Image','Upload','&','Link','Sharing']" :key="word" class="ws-landing-fade-word" :style="{ '--w-idx': index }">{{ word }}{{ index < 4 ? ' ' : '' }}</span><br />
            <span class="word-indigo"><span class="ws-landing-fade-word" style="--w-idx:5">WsUploadPicture</span></span>
          </h1>
        </div>

        <div class="ws-landing-action-panel">
          <p class="ws-landing-desc-text"><span>Upload images your way. Get direct links instantly through ImgBB, Sohu, Imgur and Telegra.ph — fast, free and no account required.</span></p>
          <div class="ws-landing-btn-group">
            <RouterLink to="/upload" class="ws-framer-btn ws-framer-primary" aria-label="Upload Images"><div class="ws-framer-btn-squish"><div class="ws-framer-btn-main"><span class="ws-framer-btn-text">Upload Images</span></div></div></RouterLink>
            <RouterLink to="/models" class="ws-framer-btn ws-framer-secondary"><div class="ws-framer-btn-squish"><div class="ws-framer-btn-main"><span class="ws-framer-btn-text">View Providers</span></div></div></RouterLink>
          </div>

          <div class="ws-landing-cta-container">
            <button type="button" class="ws-landing-endpoint-btn" aria-label="Copy upload API endpoint" @click="copyEndpoint">
              <span class="ws-landing-btn-glow" aria-hidden="true"><span class="ws-landing-btn-blob ws-blob-1" /><span class="ws-landing-btn-blob ws-blob-2" /></span>
              <span class="ws-landing-btn-label"><span class="ws-landing-endpoint-origin">{{ origin }}</span><span class="ws-landing-ticker-viewport"><Transition name="ws-ticker-slide" mode="out-in"><span :key="pathIndex" class="ws-landing-endpoint-path">{{ paths[pathIndex] }}</span></Transition></span></span>
              <span class="ws-landing-btn-badge" aria-hidden="true">
                <svg v-if="copied" class="ws-landing-badge-icon ws-badge-check" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                <template v-else><svg class="ws-landing-badge-icon ws-badge-sparkle" viewBox="0 0 24 24" fill="none"><path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z" fill="currentColor" /></svg><svg class="ws-landing-badge-icon ws-badge-copy" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg></template>
              </span>
            </button>
          </div>

          <div class="ws-landing-models-dock" :class="{ 'is-tearing-active': tearing }">
            <div v-if="tearing" class="ws-dock-layer ws-dock-layer-under" aria-hidden="true"><div v-for="brand in dockGroups[nextGroup]" :key="`under-${brand.name}`" class="ws-landing-model-pill"><BrandMark :brand="brand" /></div></div>
            <div class="ws-dock-layer ws-dock-layer-over" :class="{ 'is-ripping-away': tearing }">
              <div v-for="brand in dockGroups[currentGroup]" :key="brand.name" class="ws-landing-model-pill" :title="brand.name"><BrandMark :brand="brand" /><span class="ws-model-tooltip">{{ brand.name }}</span></div>
              <div v-if="tearing" class="ws-torn-scrap-edge" aria-hidden="true"><svg class="ws-scrap-edge-svg" viewBox="0 0 20 100" preserveAspectRatio="none"><path d="M0 0 15 6 5 14 18 24 6 34 19 45 5 56 17 66 6 76 16 86 4 94 14 100H0Z" fill="#fff" /></svg></div>
            </div>
            <div v-if="tearing" class="ws-paper-tear-rip" aria-hidden="true"><svg class="ws-tear-teeth-svg" viewBox="0 0 28 120" preserveAspectRatio="none"><path d="M0 0 18 6 7 14 24 23 9 32 26 43 6 53 22 64 8 73 25 84 7 94 20 103 5 112 16 120H0Z" fill="#fff" /></svg></div>
          </div>
        </div>
      </div>
    </main>

    <div class="ws-marquee-boundary" aria-label="Supported image providers and formats">
      <div class="ws-marquee-track-wrap"><div class="ws-marquee-track"><div v-for="copy in 2" :key="copy" class="ws-marquee-group" :aria-hidden="copy === 2"><div v-for="brand in brands" :key="`${copy}-${brand.name}`" class="ws-marquee-item"><span class="ws-marquee-icon-box"><BrandMark :brand="brand" /></span><span class="ws-marquee-name">{{ brand.name }}</span></div></div></div></div>
      <footer class="ws-landing-footer"><p class="ws-landing-footer-text"><span class="ws-footer-copy">© {{ new Date().getFullYear() }} WsUploadPicture</span><span class="ws-footer-dot">·</span><span>Created by</span><span class="ws-footer-creator">WusThanhDieu</span><span class="ws-footer-heart" aria-hidden="true"><svg class="ws-footer-heart-svg" viewBox="0 0 24 24"><defs><linearGradient id="heart"><stop stop-color="#c084fc"/><stop offset="1" stop-color="#9333ea"/></linearGradient></defs><path fill="url(#heart)" d="M12 21.35 10.55 20C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54Z"/></svg></span></p></footer>
    </div>
    <Transition name="landing-notice"><div v-if="showNotice" class="ws-landing-toast">{{ notice }}</div></Transition>
  </div>
</template>

<script lang="ts">
import { defineComponent, h, type PropType } from 'vue'
import type { Brand } from '../brands'
const BrandMark = defineComponent({
  props: { brand: { type: Object as PropType<Brand>, required: true } },
  setup(props) { return () => h('span', { class: 'ws-model-svg brand-mark', style: { '--brand-color': props.brand.color } }, props.brand.mark) }
})
export default { components: { BrandMark } }
</script>

<style>
.ws-landing-globe-canvas { pointer-events:auto; }
.brand-mark { display:grid!important; width:24px!important; height:24px!important; place-items:center; border-radius:7px; color:var(--brand-color); background:color-mix(in srgb,var(--brand-color) 11%,white); font-family:Inter,sans-serif; font-size:9px; font-weight:800; line-height:1; }
.ws-marquee-icon-box .brand-mark { width:24px!important; height:24px!important; }
.landing-notice-enter-active,.landing-notice-leave-active { transition:opacity .25s,transform .3s; }
.landing-notice-enter-from,.landing-notice-leave-to { opacity:0; transform:translate(-50%,12px); }
@media(min-width:1200px) { .ws-landing-main-title { font-size:58px; } }
@media(max-width:809.98px) { .ws-landing-main-title { font-size:29px; line-height:1; } .ws-landing-desc-text { font-size:13px; line-height:1.45; } }
@media(min-width:1025px) and (max-height:760px) { .ws-landing-hero-box { transform:scale(.88); } }
</style>
