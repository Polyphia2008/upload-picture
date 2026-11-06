import { handleUpload } from '../lib/upload'
export const onRequestPost = ({ request, env }: { request: Request; env: { IMGUR_CLIENT_ID?: string } }) => handleUpload(request, env)
export const onRequestOptions = () => new Response(null, { status: 204, headers: { Allow: 'POST, OPTIONS' } })
export const onRequest = () => Response.json({ status: 'error', msg: 'Method not allowed' }, { status: 405 })
