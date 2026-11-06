const PROVIDERS = ['imgur', 'sohu', 'imgbb', 'telegra'] as const
const MAX_SIZE = 5 * 1024 * 1024
const LEGACY_IMGUR_ID = '88fd52d307ecceb'
type Provider = typeof PROVIDERS[number]
type Env = { IMGUR_CLIENT_ID?: string }

const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } })

export async function handleUpload(request: Request, env: Env) {
  if (request.method !== 'POST') return json({ status: 'error', msg: 'Method not allowed' }, 405)
  try {
    const form = await request.formData()
    if (form.get('action') !== 'upload-img') return new Response('<pre>400 / Bad Request</pre>', { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
    const provider = String(form.get('ft') || '') as Provider
    if (!PROVIDERS.includes(provider)) return json({ status: 'error', msg: 'Not handled' }, 400)
    const files = [...form.getAll('file[]'), ...form.getAll('file')].filter((value): value is File => typeof value !== 'string' && typeof value.arrayBuffer === 'function')
    if (!files.length) return json({ status: 'error', msg: 'No file uploaded!' }, 400)
    const results = []
    for (const file of files) {
      if (!file.size) return json({ status: 'error', msg: 'No valid files uploaded!' }, 400)
      if (file.size > MAX_SIZE) return json({ status: 'error', msg: 'Maximum allowed size of 5MB.' }, 400)
      if (!await validSignature(file)) return json({ status: 'error', msg: 'Invalid image type.' }, 400)
      const link = await upload(provider, file, env)
      results.push({ name: file.name, size: `${Math.round(file.size / 1024 / 1024 * 100) / 100} MB`, link })
    }
    return json({ status: 'success', data: results, msg: 'Uploaded successfully!' })
  } catch (error) {
    return json({ status: 'error', msg: error instanceof Error ? error.message : 'Upload failed' }, 502)
  }
}

async function validSignature(file: File) {
  const b = new Uint8Array(await file.slice(0, 16).arrayBuffer())
  const text = String.fromCharCode(...b.slice(0, 6))
  const png = b.length >= 8 && [137,80,78,71,13,10,26,10].every((value, index) => b[index] === value)
  const jpg = b[0] === 255 && b[1] === 216 && b[2] === 255
  return png || jpg || text === 'GIF89a' || text === 'GIF87a'
}

async function upload(provider: Provider, file: File, env: Env): Promise<string> {
  const body = new FormData()
  let url = ''
  if (provider === 'imgur') {
    body.append('image', base64(await file.arrayBuffer()))
    body.append('type', 'base64')
    const response = await fetch('https://api.imgur.com/3/image/', { method: 'POST', headers: { Authorization: `Client-ID ${env.IMGUR_CLIENT_ID || LEGACY_IMGUR_ID}` }, body })
    const data = await parse(response)
    if (response.ok && data.status === 200 && data.data?.link) return data.data.link
    throw new Error('Failed upload from Imgur')
  }
  if (provider === 'telegra') {
    url = 'https://telegra.ph/upload'
    body.append('file', file, file.name)
  } else if (provider === 'sohu') {
    url = 'https://changyan.sohu.com/api/2/comment/attachment'
    body.append('file', file, file.name)
  } else {
    url = 'https://zh-cn.imgbb.com/json'
    body.append('source', file, file.name)
    body.append('type', 'file')
    body.append('action', 'upload')
  }
  const response = await fetch(url, { method: 'POST', body })
  const data = await parse(response)
  if (!response.ok) throw new Error(`Error code: ${response.status}`)
  if (provider === 'telegra') {
    const src = Array.isArray(data) ? data[0]?.src : null
    if (src) return new URL(src, 'https://telegra.ph').href
    throw new Error('Failed upload from Telegra.ph')
  }
  if (provider === 'sohu') {
    const value = typeof data === 'string' ? JSON.parse(data) : data
    if (value?.url) return value.url
    throw new Error('Failed upload from Sohu')
  }
  const link = data?.image?.image?.url || data?.image?.url || data?.data?.url
  if (link) return link
  throw new Error('Failed upload from ImgBB')
}

async function parse(response: Response) {
  const text = await response.text()
  try { return JSON.parse(text) }
  catch { throw new Error(`Error code: ${response.status} | Response: ${text.slice(0, 500)}`) }
}

function base64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let index = 0; index < bytes.length; index += 32768) binary += String.fromCharCode(...bytes.subarray(index, index + 32768))
  return btoa(binary)
}
