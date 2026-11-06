import { reactive, readonly } from 'vue'
export type ToastType = 'info' | 'success' | 'warning' | 'error' | 'loading'
export interface ToastItem { id: number; content: string; type: ToastType; count: number; timeout: number }
const state = reactive<{ items: ToastItem[] }>({ items: [] })
const timers = new Map<number, ReturnType<typeof setTimeout>>()
const deadlines = new Map<number, number>()
const remaining = new Map<number, number>()
let id = 0

function clearTimer(key: number) {
  const timer = timers.get(key)
  if (timer) clearTimeout(timer)
  timers.delete(key)
  deadlines.delete(key)
}
function schedule(key: number, duration?: number) {
  const item = state.items.find((entry) => entry.id === key)
  if (!item || item.timeout <= 0) return
  clearTimer(key)
  const time = duration ?? remaining.get(key) ?? item.timeout
  if (time <= 0) return close(key)
  remaining.set(key, time)
  deadlines.set(key, Date.now() + time)
  timers.set(key, setTimeout(() => close(key), time))
}
function close(key: number) {
  clearTimer(key)
  remaining.delete(key)
  state.items = state.items.filter((item) => item.id !== key)
}
function show(content: string, type: ToastType = 'info', timeout = 2500) {
  const duplicate = state.items.find((item) => item.content === content && item.type === type)
  if (duplicate) {
    duplicate.count = Math.min(99, duplicate.count + 1)
    duplicate.timeout = timeout
    remaining.set(duplicate.id, timeout)
    schedule(duplicate.id, timeout)
    return duplicate.id
  }
  const key = ++id
  state.items.push({ id: key, content, type, count: 1, timeout })
  remaining.set(key, timeout)
  schedule(key, timeout)
  if (state.items.length > 5) close(state.items[0].id)
  return key
}
function pause(key: number) {
  if (!timers.has(key)) return
  remaining.set(key, Math.max(0, (deadlines.get(key) || Date.now()) - Date.now()))
  clearTimer(key)
}
function resume(key: number) { if (!timers.has(key)) schedule(key, remaining.get(key)) }
export const Wstoast = {
  config() {},
  info: (content: string, timeout?: number) => show(content, 'info', timeout),
  success: (content: string, timeout?: number) => show(content, 'success', timeout),
  warning: (content: string, timeout?: number) => show(content, 'warning', timeout),
  error: (content: string, timeout?: number) => show(content, 'error', timeout),
  loading: (content: string) => show(content, 'loading', 0),
  close, pause, resume,
  closeAll() { [...state.items].forEach((item) => close(item.id)) }
}
export const useToastState = () => readonly(state)
if (typeof window !== 'undefined') (window as unknown as { Wstoast: typeof Wstoast }).Wstoast = Wstoast
