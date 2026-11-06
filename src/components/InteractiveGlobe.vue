<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import createGlobe from '../services/reference-globe'
const canvasRef = ref<HTMLCanvasElement | null>(null)
let globe: any
let frame = 0
let observer: ResizeObserver | undefined
let phi = 0
let drag: number | null = null
let offset = 0

function down(event: PointerEvent) {
  drag = event.clientX - offset
  canvasRef.value?.setPointerCapture(event.pointerId)
}
function move(event: PointerEvent) { if (drag !== null) offset = event.clientX - drag }
function up() { drag = null }
onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return
  let width = canvas.offsetWidth || 640
  observer = new ResizeObserver(() => { width = canvas.offsetWidth || width })
  observer.observe(canvas)
  globe = createGlobe(canvas, {
    devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2), width: width * 2, height: width * 2,
    phi: 0, theta: .15, dark: 0, diffuse: 1.2, mapSamples: 16000, mapBrightness: 6,
    baseColor: [.91,.93,.97], markerColor: [.39,.4,.95], glowColor: [.85,.88,1], opacity: 1, markers: []
  })
  const render = () => {
    if (drag === null) phi += window.innerWidth <= 810 ? .0055 : .003
    globe.update({ phi: phi + offset * .005, width: width * 2, height: width * 2 })
    frame = requestAnimationFrame(render)
  }
  render()
})
onBeforeUnmount(() => { cancelAnimationFrame(frame); observer?.disconnect(); globe?.destroy() })
</script>

<template>
  <canvas ref="canvasRef" class="ws-landing-globe-canvas" aria-label="Quả địa cầu tương tác, kéo để xoay" @pointerdown="down" @pointermove="move" @pointerup="up" @pointercancel="up" />
</template>
