export interface UploadedImage { id: string; name: string; size: string; link: string }

export async function uploadImages(files: File[], provider: string): Promise<UploadedImage[]> {
  const form = new FormData()
  form.append('ft', provider)
  form.append('action', 'upload-img')
  files.forEach((file) => form.append('file[]', file))
  let response: Response
  try { response = await fetch('/api/upload', { method: 'POST', body: form }) }
  catch { throw new Error('Mất kết nối...') }
  let data: any
  try { data = await response.json() } catch { throw new Error('Mất kết nối...') }
  if (data.status !== 'success') throw new Error(data.msg || 'Upload failed')
  return [...data.data].reverse().slice(0, 3).map((item: Omit<UploadedImage, 'id'>) => ({ ...item, id: crypto.randomUUID() }))
}

export async function copyText(text: string) {
  if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text)
  const input = document.createElement('textarea')
  input.value = text
  input.style.cssText = 'position:fixed;opacity:0'
  document.body.appendChild(input)
  input.select()
  const success = document.execCommand('copy')
  input.remove()
  if (!success) throw new Error('Copy failed')
}
