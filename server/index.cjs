// Sekund — lokalni backend server
// Pokretanje: npm run dev  (opciono: npm run dev -- --port 7100 --host 0.0.0.0)
const express = require('express')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const ROOT = path.join(__dirname, '..')
const DIST = path.join(ROOT, 'dist')
const DATA_DIR = path.join(ROOT, 'data')
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json')
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json')
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json')
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads')
const ADMIN_PASSWORD = process.env.SEKUND_ADMIN_PASSWORD || 'sekund123'

// --- arg parsing (--port / --host / env) ---
function argValue(name) {
  const i = process.argv.indexOf(`--${name}`)
  if (i !== -1 && process.argv[i + 1]) return process.argv[i + 1]
  const eq = process.argv.find((a) => a.startsWith(`--${name}=`))
  return eq ? eq.split('=')[1] : undefined
}
const PORT = Number(argValue('port') || process.env.PORT || 7100)
const HOST = argValue('host') || process.env.HOST || '0.0.0.0'

// --- storage helpers ---
function ensureData() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
  if (!fs.existsSync(PRODUCTS_FILE)) {
    const seed = require('./seed-products.json')
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(seed, null, 2))
  }
  if (!fs.existsSync(ORDERS_FILE)) fs.writeFileSync(ORDERS_FILE, '[]')
  if (!fs.existsSync(SETTINGS_FILE)) {
    const seed = require('./seed-settings.json')
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(seed, null, 2))
  }
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true })
}
function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8'))
  } catch {
    return []
  }
}
function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

// --- simple token auth (in-memory) ---
const tokens = new Map() // token -> expiry
const TOKEN_TTL = 12 * 60 * 60 * 1000 // 12h
function issueToken() {
  const t = crypto.randomBytes(24).toString('hex')
  tokens.set(t, Date.now() + TOKEN_TTL)
  return t
}
function requireAuth(req, res, next) {
  const t = (req.headers.authorization || '').replace(/^Bearer /, '')
  const exp = tokens.get(t)
  if (exp && exp > Date.now()) return next()
  return res.status(401).json({ error: 'Neovlašćen pristup' })
}

ensureData()
const app = express()
app.use(express.json({ limit: '8mb' }))

// --- auth ---
app.post('/api/login', (req, res) => {
  const { password } = req.body || {}
  if (password === ADMIN_PASSWORD) {
    return res.json({ token: issueToken() })
  }
  return res.status(401).json({ error: 'Pogrešna lozinka' })
})

// --- products (public read) ---
app.get('/api/products', (_req, res) => {
  res.json(readJson(PRODUCTS_FILE))
})

function cleanImages(images) {
  if (!Array.isArray(images)) return []
  return images
    .filter((u) => typeof u === 'string' && u.trim())
    .slice(0, 6)
    .map((u) => u.trim())
}

app.post('/api/products', requireAuth, (req, res) => {
  const { name, price, category, description, imageUrl, images, color } =
    req.body || {}
  if (!name || !category || !(Number(price) > 0)) {
    return res.status(400).json({ error: 'Naziv, kategorija i cena su obavezni.' })
  }
  const imgs = cleanImages(images)
  const primary = imgs[0] || (imageUrl ? String(imageUrl).trim() : undefined)
  const products = readJson(PRODUCTS_FILE)
  const product = {
    id: `p-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    name: String(name).trim(),
    price: Math.round(Number(price)),
    category: String(category).trim(),
    description: String(description || '').trim(),
    color: color || '#8a5a3b',
  }
  if (primary) product.imageUrl = primary
  if (imgs.length) product.images = imgs
  products.unshift(product)
  writeJson(PRODUCTS_FILE, products)
  res.status(201).json(product)
})

app.put('/api/products/:id', requireAuth, (req, res) => {
  const products = readJson(PRODUCTS_FILE)
  const idx = products.findIndex((p) => p.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'Artikal ne postoji.' })
  const { name, price, category, description, imageUrl, images, color } =
    req.body || {}
  const cur = products[idx]
  const next = {
    ...cur,
    ...(name !== undefined && { name: String(name).trim() }),
    ...(price !== undefined && { price: Math.round(Number(price)) }),
    ...(category !== undefined && { category: String(category).trim() }),
    ...(description !== undefined && { description: String(description).trim() }),
    ...(color !== undefined && { color }),
  }
  if (images !== undefined) {
    const imgs = cleanImages(images)
    next.images = imgs
    next.imageUrl = imgs[0]
  } else {
    next.imageUrl = imageUrl ? String(imageUrl).trim() : undefined
  }
  products[idx] = next
  if (!(products[idx].price > 0))
    return res.status(400).json({ error: 'Cena mora biti veća od nule.' })
  writeJson(PRODUCTS_FILE, products)
  res.json(products[idx])
})

app.delete('/api/products/:id', requireAuth, (req, res) => {
  let products = readJson(PRODUCTS_FILE)
  if (!products.some((p) => p.id === req.params.id))
    return res.status(404).json({ error: 'Artikal ne postoji.' })
  products = products.filter((p) => p.id !== req.params.id)
  writeJson(PRODUCTS_FILE, products)
  res.json({ ok: true })
})

// --- orders ---
app.post('/api/orders', (req, res) => {
  const { customer, phone, address, city, note, items, total } = req.body || {}
  if (
    !customer?.trim() ||
    !phone?.trim() ||
    !address?.trim() ||
    !city?.trim() ||
    !Array.isArray(items) ||
    items.length === 0
  ) {
    return res.status(400).json({ error: 'Nedostaju podaci za porudžbinu.' })
  }
  const orders = readJson(ORDERS_FILE)
  const order = {
    id: `o-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    createdAt: new Date().toISOString(),
    customer: String(customer).trim(),
    phone: String(phone).trim(),
    address: String(address).trim(),
    city: String(city).trim(),
    note: String(note || '').trim(),
    payment: 'pouzece',
    items: items.map((i) => ({
      name: String(i.name),
      price: Number(i.price),
      qty: Number(i.qty),
    })),
    total: Number(total),
  }
  orders.unshift(order)
  writeJson(ORDERS_FILE, orders)
  res.status(201).json({ ok: true, id: order.id })
})

app.get('/api/orders', requireAuth, (_req, res) => {
  res.json(readJson(ORDERS_FILE))
})

app.delete('/api/orders/:id', requireAuth, (req, res) => {
  let orders = readJson(ORDERS_FILE)
  orders = orders.filter((o) => o.id !== req.params.id)
  writeJson(ORDERS_FILE, orders)
  res.json({ ok: true })
})

// --- upload slika (admin) ---
const MIME_EXT = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
}
app.post('/api/upload', requireAuth, (req, res) => {
  const { dataUrl } = req.body || {}
  const m = /^data:(image\/[a-z]+);base64,(.+)$/.exec(dataUrl || '')
  if (!m || !MIME_EXT[m[1]]) {
    return res.status(400).json({ error: 'Nepodržan format slike.' })
  }
  const buf = Buffer.from(m[2], 'base64')
  if (buf.length > 6 * 1024 * 1024) {
    return res.status(400).json({ error: 'Slika je prevelika (max 6 MB).' })
  }
  const name = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${MIME_EXT[m[1]]}`
  fs.writeFileSync(path.join(UPLOADS_DIR, name), buf)
  res.status(201).json({ url: `/uploads/${name}` })
})
app.use('/uploads', express.static(UPLOADS_DIR))

// --- settings (hero kartice) ---
app.get('/api/settings', (_req, res) => {
  res.json(readJson(SETTINGS_FILE))
})

app.put('/api/settings', requireAuth, (req, res) => {
  const { heroCards, stamp, aboutText } = req.body || {}
  const cur = readJson(SETTINGS_FILE)
  const next = {
    heroCards:
      Array.isArray(heroCards) && heroCards.length === 2
        ? heroCards.map((c) => ({
            name: String(c.name || '').trim(),
            category: String(c.category || '').trim(),
            price: Math.round(Number(c.price)) || 0,
            ...(c.imageUrl ? { imageUrl: String(c.imageUrl).trim() } : {}),
          }))
        : cur.heroCards,
    stamp: typeof stamp === 'string' && stamp.trim() ? stamp.trim() : cur.stamp,
    aboutText:
      typeof aboutText === 'string' ? aboutText.trim() : (cur.aboutText ?? ''),
  }
  writeJson(SETTINGS_FILE, next)
  res.json(next)
})

// --- static frontend ---
app.use(express.static(DIST))
app.get(/^\/(?!api\/).*/, (_req, res) => {
  res.sendFile(path.join(DIST, 'index.html'))
})

app.listen(PORT, HOST, () => {
  console.log(`Sekund server radi na http://localhost:${PORT}`)
})
