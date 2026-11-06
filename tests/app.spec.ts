import { test, expect } from '@playwright/test'
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64')

test('landing has project content, globe and working navigation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/')
  await expect(page.locator('.ws-landing-main-title')).toContainText('Image Upload & Link Sharing')
  await expect(page.locator('.ws-landing-main-title')).toContainText('WsUploadPicture')
  await expect(page.locator('.ws-landing-main-title')).not.toContainText('WusRouter.Com')
  await expect(page.locator('.ws-landing-globe-canvas')).toBeVisible()
  const uploadLink = page.getByRole('link', { name: 'Upload Images', exact: true })
  await expect(uploadLink).toHaveAttribute('href', '/upload')
  await uploadLink.focus()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/upload$/)
  await expect(page.getByRole('heading', { name: 'UP ẢNH LẤY LINK' })).toBeVisible()
  expect(errors).toEqual([])
})

test('upload success preserves form contract, result and centered toast', async ({ page }) => {
  await page.route('**/api/upload', async route => {
    const body = route.request().postDataBuffer()?.toString() || ''
    expect(body).toContain('name="ft"')
    expect(body).toContain('imgbb')
    expect(body).toContain('name="action"')
    expect(body).toContain('upload-img')
    expect(body).toContain('filename="pixel.png"')
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status:'success', data:[{ name:'pixel.png', size:'0 MB', link:'https://i.imgur.com/example.png' }], msg:'Uploaded successfully!' }) })
  })
  await page.goto('/upload')
  await page.locator('.legacy-native-input').setInputFiles({ name:'pixel.png', mimeType:'image/png', buffer:png })
  await expect(page.locator('.file-item')).toHaveCount(1)
  await expect(page.locator('.file-item__link a')).toHaveAttribute('href','https://i.imgur.com/example.png')
  await expect(page.locator('.ws-toast--success')).toContainText('Uploaded successfully!')
  const box = await page.locator('.ws-toast--success').boundingBox()
  expect(box).not.toBeNull()
  expect(Math.abs((box!.x + box!.width / 2) - 720)).toBeLessThan(3)
  const titleColor = await page.locator('#upload-title').evaluate(el => getComputedStyle(el).color)
  expect(titleColor).toBe('rgb(224, 36, 36)')
})

test('provider selection and server errors are visible', async ({ page }) => {
  await page.route('**/api/upload', async route => {
    expect(route.request().postDataBuffer()?.toString()).toContain('imgur')
    await route.fulfill({ status:400, contentType:'application/json', body:JSON.stringify({ status:'error', msg:'Invalid image type.' }) })
  })
  await page.goto('/upload')
  await page.locator('.legacy-provider').filter({ hasText:'Imgur' }).click()
  await page.locator('.legacy-native-input').setInputFiles({ name:'pixel.png', mimeType:'image/png', buffer:png })
  await expect(page.locator('.ws-toast--error')).toContainText('Invalid image type.')
  await expect(page.locator('.file-item')).toHaveCount(0)
})

test('copy feedback and mobile layouts work without horizontal overflow', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read','clipboard-write'])
  await page.setViewportSize({ width:390, height:844 })
  await page.goto('/')
  await page.getByRole('button', { name:'Copy upload API endpoint' }).click()
  await expect(page.locator('.ws-landing-toast')).toContainText('Copied:')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy()
  await page.goto('/upload')
  await expect(page.locator('.legacy-native-input')).toBeAttached()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy()
  expect(await page.locator('body').evaluate(el => getComputedStyle(el).fontFamily)).toContain('Be Vietnam Pro')
})

test('all secondary routes render project-specific content', async ({ page }) => {
  for (const [path,text] of [['/models','Four sources.'],['/docs','Upload with'],['/terms','Simple terms.'],['/pricing','Free to upload.']]) {
    await page.goto(path)
    await expect(page.locator('h1')).toContainText(text)
  }
})
