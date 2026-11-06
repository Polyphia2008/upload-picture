<script setup lang="ts">
import { computed, h, ref } from 'vue'
import { Button, RadioGroup, Tooltip, UploadDragger } from 'ant-design-vue'
import { ArrowLeftOutlined, CheckOutlined, CloudUploadOutlined, CopyOutlined, FileImageOutlined, GithubOutlined, LinkOutlined, LoadingOutlined } from '@ant-design/icons-vue'
import { uploadImages, copyText, type UploadedImage } from '../services/upload'
import { Wstoast } from '../services/toast'

const providers = [
  { label: 'ImgBB', value: 'imgbb' },
  { label: 'Sohu', value: 'sohu' },
  { label: 'Imgur', value: 'imgur' },
  { label: 'Telegra', value: 'telegra' }
]
const provider = ref('imgbb')
const loading = ref(false)
const dragging = ref(false)
const results = ref<UploadedImage[]>([])
const nativeInput = ref<HTMLInputElement | null>(null)
const currentProvider = computed(() => providers.find((item) => item.value === provider.value)?.label || 'ImgBB')

async function startUpload(files: File[]) {
  if (!files.length || loading.value) return
  loading.value = true
  Wstoast.loading('Waiting uploading...')
  try {
    const uploaded = await uploadImages(files, provider.value)
    results.value = [...uploaded, ...results.value]
    Wstoast.closeAll()
    Wstoast.success('Uploaded successfully!')
  } catch (error) {
    Wstoast.closeAll()
    Wstoast.error(error instanceof Error ? error.message : 'Mất kết nối...')
  } finally {
    loading.value = false
    if (nativeInput.value) nativeInput.value.value = ''
  }
}
function beforeUpload(_file: File, files: File[]) {
  if (!loading.value) void startUpload(files)
  return false
}
function onFileChange(event: Event) {
  void startUpload(Array.from((event.target as HTMLInputElement).files || []))
}
async function copyLink(link: string) {
  try {
    await copyText(link)
    Wstoast.success('Đã sao chép vào bộ nhớ tạm!')
  } catch {
    Wstoast.error('Lỗi khi sao chép vào bộ nhớ tạm!')
  }
}
</script>

<template>
  <div class="legacy-upload-page">
    <div class="legacy-upload-page__glow" aria-hidden="true" />
    <header class="legacy-header">
      <RouterLink to="/" class="legacy-brand"><img src="/logo.png" alt="" /><span>WsUploadPicture</span></RouterLink>
      <RouterLink to="/" class="legacy-home"><ArrowLeftOutlined /> Trang chủ</RouterLink>
    </header>

    <main class="legacy-main">
      <section class="popular" aria-labelledby="upload-title">
        <div class="thanhdieu-card-bg upload-panel">
          <div class="upload-panel__heading">
            <span class="upload-panel__mini-badge"><FileImageOutlined /> IMAGE HOSTING</span>
            <h1 id="upload-title" class="text-red">UP ẢNH LẤY LINK</h1>
            <p>Upload images your way.</p>
          </div>

          <form class="upload-form" enctype="multipart/form-data" @submit.prevent>
            <fieldset class="provider-fieldset" :disabled="loading">
              <legend>Chọn nguồn upload</legend>
              <RadioGroup v-model:value="provider" class="legacy-provider-group" :disabled="loading" aria-label="Nguồn upload">
                <Tooltip v-for="item in providers" :key="item.value" :title="`Upload bằng ${item.label}`" placement="top">
                  <label class="legacy-provider" :class="{ 'legacy-provider--active': provider === item.value }">
                    <input v-model="provider" type="radio" name="ft" :value="item.value" :disabled="loading" />
                    <span class="legacy-provider__radio"><i /></span>
                    <span>{{ item.label }}</span>
                  </label>
                </Tooltip>
              </RadioGroup>
            </fieldset>

            <UploadDragger
              id="drop-area"
              name="file"
              accept="image/png,image/jpeg,image/gif"
              :multiple="true"
              :show-upload-list="false"
              :disabled="loading"
              :before-upload="beforeUpload"
              :open-file-dialog-on-click="false"
              class="legacy-dragger"
              :class="{ 'legacy-dragger--active': dragging, 'legacy-dragger--loading': loading }"
              @dragenter="dragging = true"
              @dragleave="dragging = false"
              @drop="dragging = false"
            >
              <div class="legacy-drop-content">
                <input ref="nativeInput" class="legacy-native-input" type="file" accept="image/*" multiple :disabled="loading" aria-label="Chọn ảnh từ thiết bị" @change="onFileChange" @click.stop />
                <div class="legacy-drop-visual" :class="{ 'legacy-drop-visual--loading': loading }">
                  <div v-if="loading" class="legacy-spinner"><LoadingOutlined /></div>
                  <template v-else><span class="legacy-drop-ring legacy-drop-ring--one" /><span class="legacy-drop-ring legacy-drop-ring--two" /><img class="has-mask" src="/upload-illustration.png" alt="Upload" /></template>
                </div>
                <div v-if="loading" class="legacy-drop-copy">
                  <strong>Đang tải lên {{ currentProvider }}...</strong><span>Vui lòng chờ trong giây lát</span><div class="legacy-upload-progress"><i /></div>
                </div>
                <div v-else class="legacy-drop-copy">
                  <p><strong>Kéo hoặc thả ảnh</strong> vào đây<br />hoặc <button type="button" class="legacy-select-link" @click.stop="nativeInput?.click()">chọn ảnh</button> từ thiết bị của bạn</p>
                  <Button type="primary" class="legacy-upload-button" :icon="h(CloudUploadOutlined)" @click.stop="nativeInput?.click()">Chọn ảnh để tải lên</Button>
                </div>
              </div>
            </UploadDragger>
            <p class="legacy-support"><span><CheckOutlined /></span> Support: png, jpg, jpeg, gif <i /> max size <strong>5 MB</strong></p>
          </form>

          <Transition name="legacy-results">
            <section v-if="results.length" class="legacy-results" aria-labelledby="results-title">
              <div class="legacy-results__heading"><h2 id="results-title"><LinkOutlined /> Link ảnh đã upload</h2><span>{{ results.length }}</span></div>
              <TransitionGroup name="legacy-result" tag="div" class="preload">
                <article v-for="item in results" :key="item.id" class="file-item">
                  <div class="file-item__thumb"><img :src="item.link" :alt="item.name" loading="lazy" /></div>
                  <div class="file-item__content">
                    <div class="file-item__meta"><strong :title="item.name">Tên ảnh: {{ item.name }}</strong><span>Dung lượng: {{ item.size }}</span></div>
                    <div class="file-item__link"><a :href="item.link" target="_blank" rel="noreferrer">{{ item.link }}</a><Tooltip title="Sao chép link"><button type="button" :aria-label="`Sao chép link ${item.name}`" @click="copyLink(item.link)"><CopyOutlined /></button></Tooltip></div>
                  </div>
                </article>
              </TransitionGroup>
            </section>
          </Transition>
        </div>
      </section>
    </main>

    <footer class="legacy-footer"><a href="https://github.com/WusThanhDieu" target="_blank" rel="noreferrer"><GithubOutlined /> Github - WusThanhDieu</a><span>© {{ new Date().getFullYear() }} WsUploadPicture</span></footer>
  </div>
</template>

<style scoped>
.legacy-upload-page { position:relative; display:flex; min-height:100vh; min-height:100dvh; overflow-x:hidden; flex-direction:column; color:#fff; background:#210505 url('/upload-background.jpeg') center/cover fixed no-repeat; font-family:"Be Vietnam Pro",sans-serif; isolation:isolate; }
.legacy-upload-page::before { content:""; position:fixed; inset:0; z-index:-1; background:linear-gradient(115deg,rgba(25,3,5,.48),rgba(8,3,5,.25)); }
.legacy-upload-page__glow { position:fixed; inset:0; z-index:-1; pointer-events:none; background:radial-gradient(circle at 50% 42%,rgba(189,12,12,.17),transparent 38%),radial-gradient(circle at 88% 20%,rgba(189,12,12,.12),transparent 28%); }
.legacy-header { position:absolute; top:0; right:0; left:0; z-index:20; display:flex; height:74px; padding:0 42px; align-items:center; justify-content:space-between; }
.legacy-brand { display:flex; align-items:center; gap:8px; color:rgba(255,255,255,.8); text-decoration:none; font-size:14px; font-weight:650; letter-spacing:-.03em; }
.legacy-brand img { width:34px; height:28px; object-fit:contain; filter:hue-rotate(285deg) saturate(2.4); }
.legacy-home { display:flex; padding:8px 13px; align-items:center; gap:7px; border:1px solid rgba(255,255,255,.1); border-radius:10px; color:rgba(255,255,255,.65); background:rgba(18,12,12,.35); backdrop-filter:blur(12px); text-decoration:none; font-size:11px; transition:color .2s,border-color .2s,background .2s; }
.legacy-home:hover { color:#fff; border-color:rgba(189,12,12,.5); background:rgba(189,12,12,.12); }
.legacy-main { display:flex; width:100%; min-height:100dvh; padding:78px 16px 66px; align-items:center; justify-content:center; }
.popular { position:relative; z-index:1; width:100%; max-width:510px; }
.popular::before { position:absolute; z-index:-1; content:""; inset:-2px; border-radius:17px; padding:2px; background:linear-gradient(163deg,#ef2020 0%,rgba(255,255,255,0) 48%,#bd0c0c 100%); -webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0); -webkit-mask-composite:xor; mask-composite:exclude; filter:drop-shadow(0 0 14px rgba(189,12,12,.12)); }
.thanhdieu-card-bg { background:rgba(18,12,12,.82); }
.upload-panel { position:relative; padding:30px; border:1px solid rgba(255,255,255,.04); border-radius:15px; box-shadow:0 30px 80px -25px rgba(0,0,0,.7),inset 0 1px rgba(255,255,255,.04); backdrop-filter:blur(22px) saturate(120%); animation:legacy-panel-in .65s cubic-bezier(.16,1,.3,1) both; }
.upload-panel__heading { margin-bottom:23px; text-align:center; }
.upload-panel__mini-badge { display:inline-flex; padding:4px 9px; align-items:center; gap:5px; border:1px solid rgba(189,12,12,.22); border-radius:999px; color:#bd5555; background:rgba(189,12,12,.07); font-size:8px; font-weight:650; letter-spacing:.13em; }
.upload-panel__heading h1 { margin:14px 0 5px; font-size:29px; font-weight:750; line-height:1.25; letter-spacing:-.045em; }
.text-red { color:#e02424; text-shadow:0 0 22px rgba(189,12,12,.6); }
.upload-panel__heading p { margin:0; color:#c38c8c; font-size:12px; }
.upload-form { display:flex; flex-direction:column; gap:14px; }
.provider-fieldset { min-width:0; margin:0; padding:0; border:0; }
.provider-fieldset legend { margin-bottom:8px; color:#9c7777; font-size:9px; font-weight:550; }
.legacy-provider-group { display:grid!important; width:100%; padding:4px; grid-template-columns:repeat(4,1fr); gap:3px; border:1px solid rgba(143,2,2,.38); border-radius:12px; background:rgba(7,3,3,.36); }
.legacy-provider { position:relative; display:flex; height:38px; cursor:pointer; align-items:center; justify-content:center; gap:6px; border:1px solid transparent; border-radius:8px; color:#a78888; font-size:10.5px; font-weight:550; transition:color .2s,background .2s,border-color .2s,box-shadow .2s; }
.legacy-provider:hover { color:#e9b6b6; background:rgba(189,12,12,.07); }
.legacy-provider input { position:absolute; width:1px; height:1px; opacity:0; }
.legacy-provider__radio { display:grid; width:12px; height:12px; place-items:center; border:1px solid #743232; border-radius:50%; transition:border-color .2s,box-shadow .2s; }
.legacy-provider__radio i { width:5px; height:5px; border-radius:50%; background:transparent; transform:scale(0); transition:transform .22s cubic-bezier(.175,.885,.32,1.275),background .2s; }
.legacy-provider--active { color:#ffb3b3; border-color:rgba(189,12,12,.26); background:linear-gradient(135deg,rgba(189,12,12,.17),rgba(189,12,12,.06)); box-shadow:inset 0 1px rgba(255,255,255,.035); }
.legacy-provider--active .legacy-provider__radio { border-color:#bd0c0c; box-shadow:0 0 8px rgba(189,12,12,.28); }
.legacy-provider--active .legacy-provider__radio i { background:#ef4444; transform:scale(1); }
.legacy-dragger { display:block; }
.legacy-dragger :deep(.ant-upload) { overflow:hidden; border:1.5px dashed rgba(189,12,12,.62)!important; border-radius:13px!important; background:linear-gradient(145deg,rgba(189,12,12,.035),rgba(0,0,0,.11))!important; transition:border-color .25s,background .25s,box-shadow .25s!important; }
.legacy-dragger:hover :deep(.ant-upload),.legacy-dragger--active :deep(.ant-upload) { border-color:#ef4444!important; background:linear-gradient(354deg,rgba(228,25,25,.14),rgba(41,6,6,.08))!important; box-shadow:inset 0 0 40px rgba(189,12,12,.08),0 0 20px rgba(189,12,12,.06); }
.legacy-dragger :deep(.ant-upload-drag-container) { min-height:224px; }
.legacy-drop-content { display:flex; min-height:224px; padding:20px 18px; flex-direction:column; align-items:center; justify-content:center; }
.legacy-native-input { position:absolute; width:1px; height:1px; opacity:0; pointer-events:none; }
.legacy-drop-visual { position:relative; display:grid; width:108px; height:85px; margin-bottom:6px; place-items:center; }
.legacy-drop-visual img { position:relative; z-index:2; width:98px; height:78px; object-fit:contain; filter:drop-shadow(0 7px 13px rgba(189,12,12,.16)); animation:legacy-float 4s ease-in-out infinite; }
.legacy-drop-ring { position:absolute; border:1px solid rgba(189,12,12,.15); border-radius:50%; }
.legacy-drop-ring--one { width:105px; height:56px; transform:rotate(-15deg); }
.legacy-drop-ring--two { width:80px; height:78px; border-style:dashed; transform:rotate(30deg); animation:legacy-spin 14s linear infinite; }
.legacy-drop-copy { text-align:center; }
.legacy-drop-copy p { margin:0 0 10px; color:#c8aaaa; font-size:11px; line-height:1.8; }
.legacy-drop-copy strong { color:#f1d5d5; font-weight:550; }
.legacy-select-link { cursor:pointer; padding:0; border:0; color:#ef4444; background:none; font-weight:600; }
.legacy-select-link:hover { text-decoration:underline; }
.legacy-upload-button { height:33px!important; padding:0 14px!important; border:1px solid rgba(255,255,255,.07)!important; border-radius:9px!important; background:linear-gradient(9deg,#4b0e0e,#251212)!important; box-shadow:0 7px 20px -10px #bd0c0c,inset 0 1px rgba(255,255,255,.07)!important; font-size:10px!important; font-weight:550!important; }
.legacy-upload-button:hover { border-color:rgba(189,12,12,.5)!important; background:linear-gradient(9deg,#661111,#351414)!important; transform:translateY(-1px); }
.legacy-support { display:flex; margin:-2px 0 0; align-items:center; justify-content:center; gap:5px; color:#a66a6a; font-size:8.5px; }
.legacy-support > span { color:#bd0c0c; font-size:9px; }
.legacy-support i { width:2px; height:2px; margin:0 2px; border-radius:50%; background:#743232; }
.legacy-support strong { color:#cf8181; font-weight:550; }
.legacy-spinner { display:grid; width:62px; height:62px; place-items:center; border:2px solid rgba(189,12,12,.13); border-top-color:#bd0c0c; border-radius:50%; color:#ef4444; font-size:23px; animation:legacy-spin 1.2s linear infinite; }
.legacy-spinner :deep(svg) { animation:legacy-spin 1.2s linear infinite reverse; }
.legacy-drop-copy > span { color:#9b6b6b; font-size:10px; }
.legacy-upload-progress { width:160px; height:3px; margin:13px auto 0; overflow:hidden; border-radius:99px; background:rgba(255,255,255,.06); }
.legacy-upload-progress i { display:block; width:40%; height:100%; background:linear-gradient(90deg,transparent,#ef4444,transparent); animation:legacy-progress 1.2s ease infinite; }
.legacy-results { margin-top:19px; padding-top:17px; border-top:1px solid rgba(143,2,2,.22); }
.legacy-results__heading { display:flex; margin-bottom:10px; align-items:center; justify-content:space-between; }
.legacy-results__heading h2 { display:flex; margin:0; align-items:center; gap:6px; color:#d3b0b0; font-size:10.5px; font-weight:600; }
.legacy-results__heading h2 :deep(svg) { color:#bd0c0c; }
.legacy-results__heading > span { display:grid; min-width:18px; height:18px; place-items:center; border-radius:99px; color:#dc9292; background:rgba(189,12,12,.1); font-size:8px; }
.preload { display:flex; max-height:250px; overflow-y:auto; flex-direction:column; gap:8px; scrollbar-width:thin; scrollbar-color:#8f0202 transparent; }
.file-item { display:flex; padding:9px; align-items:center; gap:10px; border:1px solid rgba(143,2,2,.23); border-radius:11px; background:rgba(36,22,22,.74); }
.file-item__thumb { width:42px; height:42px; flex:0 0 42px; overflow:hidden; border-radius:8px; background:#170b0b; }
.file-item__thumb img { width:100%; height:100%; object-fit:cover; }
.file-item__content { min-width:0; flex:1; }
.file-item__meta { display:flex; align-items:center; justify-content:space-between; gap:7px; }
.file-item__meta strong { overflow:hidden; color:#d4bcbc; font-size:9px; font-weight:550; text-overflow:ellipsis; white-space:nowrap; }
.file-item__meta span { flex-shrink:0; color:#856b6b; font-size:7.5px; }
.file-item__link { display:flex; margin-top:5px; align-items:center; gap:5px; }
.file-item__link a { overflow:hidden; flex:1; color:#d87575; font-size:8.5px; text-overflow:ellipsis; white-space:nowrap; }
.file-item__link button { display:grid; width:25px; height:25px; flex-shrink:0; cursor:pointer; place-items:center; border:1px solid rgba(189,12,12,.16); border-radius:7px; color:#d56868; background:rgba(189,12,12,.08); font-size:10px; transition:color .2s,background .2s; }
.file-item__link button:hover { color:white; background:#8f1010; }
.legacy-footer { position:absolute; right:34px; bottom:20px; left:34px; display:flex; align-items:center; justify-content:space-between; color:rgba(202,146,146,.4); font-size:8px; }
.legacy-footer a { display:flex; align-items:center; gap:5px; color:#bd5555; text-decoration:none; }
.legacy-footer a:hover { color:#ef7777; }
.legacy-results-enter-active { transition:opacity .35s,transform .4s cubic-bezier(.16,1,.3,1); }
.legacy-results-enter-from { opacity:0; transform:translateY(12px); }
.legacy-result-enter-active { animation:legacy-result-in .45s cubic-bezier(.16,1,.3,1); }
.legacy-result-move { transition:transform .35s; }
@keyframes legacy-panel-in { from { opacity:0; transform:translateY(16px) scale(.97); filter:blur(7px); } to { opacity:1; transform:none; filter:blur(0); } }
@keyframes legacy-float { 0%,100% { transform:translateY(0) rotate(-2deg); } 50% { transform:translateY(-5px) rotate(2deg); } }
@keyframes legacy-spin { to { transform:rotate(360deg); } }
@keyframes legacy-progress { from { transform:translateX(-100%); } to { transform:translateX(350%); } }
@keyframes legacy-result-in { from { opacity:0; transform:translateY(-10px) scale(.98); } to { opacity:1; transform:none; } }
@media(max-width:640px) { .legacy-header { height:62px; padding:0 16px; } .legacy-brand { font-size:12px; } .legacy-brand img { width:29px; } .legacy-home { padding:7px 10px; font-size:9px; } .legacy-main { padding:72px 13px 66px; align-items:flex-start; } .upload-panel { padding:23px 17px; } .upload-panel__heading h1 { font-size:25px; } .legacy-provider { gap:4px; font-size:9px; } .legacy-provider__radio { width:11px; height:11px; } .legacy-drop-content,.legacy-dragger :deep(.ant-upload-drag-container) { min-height:215px; } .legacy-footer { position:relative; right:auto; bottom:auto; left:auto; margin-top:-48px; padding:0 16px 18px; justify-content:center; } .legacy-footer > span { display:none; } }
@media(max-height:760px) and (min-width:641px) { .legacy-main { padding-top:72px; padding-bottom:54px; align-items:flex-start; } .upload-panel { padding:22px 26px; } .upload-panel__heading { margin-bottom:16px; } .upload-panel__heading h1 { margin-top:10px; font-size:26px; } .legacy-drop-content,.legacy-dragger :deep(.ant-upload-drag-container) { min-height:198px; } }
@media(prefers-reduced-motion:reduce) { .upload-panel,.legacy-drop-visual img,.legacy-drop-ring { animation:none!important; } }
</style>
