// Smanji sliku pre uploada (max 1600px) i iseče pozadinu,
// da odeća izgleda kao da visi na vešalici bez poda/zida oko nje.
// Pozadina se prepoznaje kao jednolična boja sa ivica slike (zid, pod...),
// pa najbolje radi kad slikaš uz običan zid.
const MAX_DIM = 1600

function cutBackground(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas
  const w = canvas.width
  const h = canvas.height
  const img = ctx.getImageData(0, 0, w, h)
  const d = img.data

  // prosečna boja pozadine iz 4 ugla (parcela 10x10)
  let r0 = 0
  let g0 = 0
  let b0 = 0
  let n = 0
  const corners = [
    [0, 0],
    [w - 1, 0],
    [0, h - 1],
    [w - 1, h - 1],
  ]
  for (const [cx, cy] of corners) {
    for (let y = Math.max(0, cy - 5); y < Math.min(h, cy + 5); y++) {
      for (let x = Math.max(0, cx - 5); x < Math.min(w, cx + 5); x++) {
        const i = (y * w + x) * 4
        r0 += d[i]
        g0 += d[i + 1]
        b0 += d[i + 2]
        n++
      }
    }
  }
  r0 /= n
  g0 /= n
  b0 /= n

  const tol = 55
  const tol2 = tol * tol
  const matches = (i: number) => {
    const dr = d[i] - r0
    const dg = d[i + 1] - g0
    const db = d[i + 2] - b0
    return dr * dr + dg * dg + db * db < tol2
  }

  // poplava sa ivica ka unutra — briše samo spojenu pozadinu
  const visited = new Uint8Array(w * h)
  const stack: number[] = []
  const push = (p: number) => {
    if (visited[p]) return
    const i = p * 4
    if (!matches(i)) return
    visited[p] = 1
    d[i + 3] = 0
    stack.push(p)
  }
  for (let x = 0; x < w; x++) {
    push(x)
    push((h - 1) * w + x)
  }
  for (let y = 0; y < h; y++) {
    push(y * w)
    push(y * w + w - 1)
  }
  while (stack.length) {
    const p = stack.pop()!
    const x = p % w
    const y = (p / w) | 0
    if (x > 0) push(p - 1)
    if (x < w - 1) push(p + 1)
    if (y > 0) push(p - w)
    if (y < h - 1) push(p + w)
  }

  // iseči na okvir odeće (+ mala margina)
  let minX = w
  let minY = h
  let maxX = -1
  let maxY = -1
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (d[(y * w + x) * 4 + 3] > 10) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }
  if (maxX < 0) return canvas // sve je "pozadina" — vrati original
  const mx = Math.round(w * 0.03)
  const my = Math.round(h * 0.03)
  minX = Math.max(0, minX - mx)
  minY = Math.max(0, minY - my)
  maxX = Math.min(w - 1, maxX + mx)
  maxY = Math.min(h - 1, maxY + my)

  ctx.putImageData(img, 0, 0)
  const out = document.createElement('canvas')
  out.width = maxX - minX + 1
  out.height = maxY - minY + 1
  const octx = out.getContext('2d')
  if (!octx) return canvas
  octx.drawImage(
    canvas,
    minX,
    minY,
    out.width,
    out.height,
    0,
    0,
    out.width,
    out.height,
  )
  return out
}

export function shrinkImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(img.src)
      try {
        let { width, height } = img
        const scale = Math.min(1, MAX_DIM / width, MAX_DIM / height)
        width = Math.max(1, Math.round(width * scale))
        height = Math.max(1, Math.round(height * scale))
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('canvas'))
        ctx.drawImage(img, 0, 0, width, height)
        const cut = cutBackground(canvas)
        // PNG čuva providnost (isečena pozadina)
        resolve(cut.toDataURL('image/png'))
      } catch {
        reject(new Error('decode'))
      }
    }
    img.onerror = () => reject(new Error('decode'))
    img.src = URL.createObjectURL(file)
  })
}
