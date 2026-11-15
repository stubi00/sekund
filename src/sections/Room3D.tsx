import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { ChevronLeft, ChevronRight, ShoppingBasket } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Product } from '@/types'
import { formatRsd } from '@/lib/format'

interface Props {
  products: Product[]
  loading?: boolean
  genders: string[]
  category: string
  gender: string
  stamp?: string
  onCategoryChange: (c: string) => void
  onGenderChange: (g: string) => void
  onView: (p: Product) => void
  onAdd: (p: Product) => void
}

const SPACING = 1.7
const ROD_Y = 2.1
const GARMENT_W = 1.0
const GARMENT_H = 1.3
const WALL_Z = -0.35

/* Tekstura sa slovom kad artikal nema sliku */
function letterTexture(letter: string, color: string) {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 640
  const ctx = c.getContext('2d')!
  ctx.fillStyle = color
  ctx.fillRect(0, 0, c.width, c.height)
  const grad = ctx.createLinearGradient(0, 0, 0, c.height)
  grad.addColorStop(0, 'rgba(255,255,255,0.14)')
  grad.addColorStop(1, 'rgba(0,0,0,0.18)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, c.width, c.height)
  ctx.fillStyle = 'rgba(255,255,255,0.92)'
  ctx.font = '700 300px Georgia, serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(letter, c.width / 2, c.height / 2 + 16)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  return t
}

/* Natpis SEKUND na zidu */
function signTexture() {
  const c = document.createElement('canvas')
  c.width = 2048
  c.height = 640
  const ctx = c.getContext('2d')!
  ctx.clearRect(0, 0, c.width, c.height)
  ctx.fillStyle = '#2b2b25'
  ctx.textAlign = 'center'
  ctx.font = '600 64px Georgia, serif'
  ctx.save()
  ctx.translate(c.width / 2, 150)
  ctx.fillText('V I R T U A L N A   P R O D A V N I C A', 0, 0)
  ctx.restore()
  ctx.font = '700 330px Georgia, serif'
  ctx.fillText('SEKUND', c.width / 2, 470)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  return t
}

/* Okrugli pečat na zidu */
function stampTexture(text: string) {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 512
  const ctx = c.getContext('2d')!
  const col = '#b5502e'
  ctx.strokeStyle = col
  ctx.lineWidth = 10
  ctx.setLineDash([22, 14])
  ctx.beginPath()
  ctx.arc(256, 256, 220, 0, Math.PI * 2)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.fillStyle = col
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const lines = text.split('\n').filter(Boolean)
  const lh = 74
  const y0 = 256 - ((lines.length - 1) * lh) / 2
  ctx.font = '700 52px Georgia, serif'
  lines.forEach((l, i) => ctx.fillText(l.toUpperCase(), 256, y0 + i * lh, 380))
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  return t
}

/* Pod — drvene daske */
function floorTexture() {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 512
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#b08a64'
  ctx.fillRect(0, 0, 512, 512)
  for (let y = 0; y < 512; y += 64) {
    ctx.fillStyle = 'rgba(70,48,30,0.35)'
    ctx.fillRect(0, y, 512, 3)
    for (let x = 0; x < 512; x += 4) {
      ctx.fillStyle = `rgba(120,85,55,${0.04 + 0.05 * Math.abs(Math.sin(x * 0.7 + y))})`
      ctx.fillRect(x, y + 3, 4, 61)
    }
    const off = (y / 64) % 2 === 0 ? 180 : 380
    ctx.fillStyle = 'rgba(120,85,55,0.5)'
    ctx.fillRect(off, y, 3, 64)
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.wrapS = THREE.RepeatWrapping
  t.wrapT = THREE.RepeatWrapping
  t.repeat.set(60, 2.2)
  t.anisotropy = 8
  return t
}

/* Vešalica: kuka + rama */
function createHanger(metal: THREE.Material) {
  const g = new THREE.Group()
  const hook = new THREE.Mesh(
    new THREE.TorusGeometry(0.055, 0.011, 10, 24, Math.PI),
    metal,
  )
  hook.position.y = -0.028
  g.add(hook)
  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.011, 0.011, 0.09, 8),
    metal,
  )
  neck.position.y = -0.115
  g.add(neck)
  const bar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.012, 0.012, GARMENT_W * 0.9, 8),
    metal,
  )
  bar.rotation.z = Math.PI / 2
  bar.position.y = -0.165
  g.add(bar)
  return g
}

export default function Room3D({
  products,
  loading,
  genders,
  category,
  gender,
  stamp,
  onCategoryChange,
  onGenderChange,
  onView,
  onAdd,
}: Props) {
  const mountRef = useRef<HTMLDivElement>(null)
  const [focused, setFocused] = useState(0)

  const categories = useMemo(
    () => ['Sve', ...Array.from(new Set(products.map((p) => p.category)))],
    [products],
  )
  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          (gender === 'Sve' || p.gender === gender) &&
          (category === 'Sve' || p.category === category),
      ),
    [products, gender, category],
  )

  const filteredKey = filtered.map((p) => p.id).join('|')
  const stateRef = useRef<{
    targetX: number
    items: { group: THREE.Group; product: Product; hit: THREE.Mesh }[]
    setCam: (x: number) => void
  }>({ targetX: 0, items: [], setCam: () => {} })

  /* Glavni efekat — pravi sobu i artikle */
  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.outputColorSpace = THREE.SRGBColorSpace
    mount.appendChild(renderer.domElement)
    renderer.domElement.style.display = 'block'
    renderer.domElement.style.cursor = 'grab'
    renderer.domElement.style.touchAction = 'pan-y'

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#ece5db')

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 60)
    camera.position.set(0, 1.75, 5.1)

    /* Svetlost */
    scene.add(new THREE.HemisphereLight(0xfff6ea, 0x8a7a68, 1.0))
    const key = new THREE.DirectionalLight(0xfff1de, 2.2)
    key.castShadow = true
    key.shadow.mapSize.set(2048, 2048)
    key.shadow.camera.left = -4
    key.shadow.camera.right = 4
    key.shadow.camera.top = 4
    key.shadow.camera.bottom = -3
    key.shadow.camera.far = 20
    key.shadow.bias = -0.0004
    key.shadow.radius = 5
    scene.add(key, key.target)
    const fill = new THREE.DirectionalLight(0xdfe8ff, 0.5)
    fill.position.set(-4, 3, 5)
    scene.add(fill)

    /* Materijali sobe */
    const wallMat = new THREE.MeshStandardMaterial({
      color: '#ece5db',
      roughness: 0.95,
    })
    const metalMat = new THREE.MeshStandardMaterial({
      color: '#6b6b66',
      roughness: 0.35,
      metalness: 0.8,
    })

    const room = new THREE.Group()
    scene.add(room)

    /* Pod */
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(400, 14),
      new THREE.MeshStandardMaterial({
        map: floorTexture(),
        roughness: 0.75,
      }),
    )
    floor.rotation.x = -Math.PI / 2
    floor.position.z = 4
    floor.receiveShadow = true
    room.add(floor)

    /* Zadnji zid */
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(400, 6), wallMat)
    wall.position.set(0, 3, WALL_Z)
    wall.receiveShadow = true
    room.add(wall)

    /* Sokla */
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(400, 0.12, 0.03),
      new THREE.MeshStandardMaterial({ color: '#d8cfc2', roughness: 0.9 }),
    )
    base.position.set(0, 0.06, WALL_Z + 0.015)
    room.add(base)

    /* Natpis */
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(5.2, 1.625),
      new THREE.MeshBasicMaterial({
        map: signTexture(),
        transparent: true,
      }),
    )
    sign.position.set(0, 3.3, WALL_Z + 0.02)
    room.add(sign)

    /* Pečat na zidu */
    let stampMesh: THREE.Mesh | null = null
    if (stamp) {
      stampMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(0.85, 0.85),
        new THREE.MeshBasicMaterial({
          map: stampTexture(stamp),
          transparent: true,
        }),
      )
      stampMesh.position.set(3.6, 3.25, WALL_Z + 0.02)
      room.add(stampMesh)
    }

    /* Šipka */
    const rod = new THREE.Mesh(
      new THREE.CylinderGeometry(0.016, 0.016, 400, 12),
      metalMat,
    )
    rod.rotation.z = Math.PI / 2
    rod.position.set(0, ROD_Y, 0)
    rod.castShadow = true
    room.add(rod)

    /* Artikli */
    const texCache = new Map<string, THREE.Texture>()
    const loader = new THREE.TextureLoader()
    loader.crossOrigin = 'anonymous'
    const itemRoot = new THREE.Group()
    scene.add(itemRoot)

    const st = stateRef.current
    st.items = []
    const n = filtered.length
    const minX = n ? 0 : 0
    const maxX = n ? (n - 1) * SPACING : 0

    filtered.forEach((p, i) => {
      const group = new THREE.Group()
      group.position.set(i * SPACING, ROD_Y, 0)

      group.add(createHanger(metalMat))

      const img = p.images?.[0] || p.imageUrl
      let tex: THREE.Texture
      if (img) {
        const cached = texCache.get(img)
        if (cached) {
          tex = cached
        } else {
          tex = loader.load(img)
          tex.colorSpace = THREE.SRGBColorSpace
          tex.anisotropy = 4
          texCache.set(img, tex)
        }
      } else {
        tex = letterTexture(p.name.charAt(0), p.color)
      }
      const mat = new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.9,
        side: THREE.DoubleSide,
      })
      const garment = new THREE.Mesh(
        new THREE.PlaneGeometry(GARMENT_W, GARMENT_H),
        mat,
      )
      garment.position.y = -0.19 - GARMENT_H / 2
      garment.position.z = 0.035
      garment.castShadow = true
      garment.userData.productIndex = i
      group.add(garment)

      itemRoot.add(group)
      st.items.push({ group, product: p, hit: garment })
    })

    /* Kamera — pozicija i kretanje */
    let camX = 0
    st.targetX = 0
    st.setCam = (x: number) => {
      st.targetX = Math.max(minX, Math.min(maxX, x))
    }
    setFocused(0)

    /* Prevlačenje */
    let dragging = false
    let downX = 0
    let downY = 0
    let startTarget = 0
    let moved = 0
    const el = renderer.domElement
    const pxToWorld = () => {
      const h = mount.clientHeight
      const worldH =
        2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * 5.1
      return worldH / h
    }
    const onDown = (e: PointerEvent) => {
      dragging = true
      moved = 0
      downX = e.clientX
      downY = e.clientY
      startTarget = st.targetX
      el.style.cursor = 'grabbing'
    }
    const onMove = (e: PointerEvent) => {
      if (!dragging) return
      const dx = e.clientX - downX
      moved = Math.max(moved, Math.abs(dx) + Math.abs(e.clientY - downY) * 0.2)
      st.setCam(startTarget - dx * pxToWorld())
    }
    const onUp = (e: PointerEvent) => {
      if (!dragging) return
      dragging = false
      el.style.cursor = 'grab'
      if (moved < 6) {
        /* klik — pogodi artikal */
        const r = el.getBoundingClientRect()
        const ndc = new THREE.Vector2(
          ((e.clientX - r.left) / r.width) * 2 - 1,
          -((e.clientY - r.top) / r.height) * 2 + 1,
        )
        const ray = new THREE.Raycaster()
        ray.setFromCamera(ndc, camera)
        const hits = ray.intersectObjects(
          st.items.map((it) => it.hit),
          false,
        )
        if (hits.length) {
          const idx = hits[0].object.userData.productIndex as number
          const item = st.items[idx]
          if (item) onView(item.product)
        }
      }
    }
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return
      const canLeft = st.targetX > minX + 0.01
      const canRight = st.targetX < maxX - 0.01
      if ((e.deltaY > 0 && canRight) || (e.deltaY < 0 && canLeft)) {
        e.preventDefault()
        st.setCam(st.targetX + e.deltaY * 0.004)
      }
    }
    el.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    el.addEventListener('wheel', onWheel, { passive: false })

    /* Veličina */
    const resize = () => {
      const w = mount.clientWidth
      const h = mount.clientHeight
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      /* na uskim ekranima natpis staje u kadar */
      const k = Math.max(0.5, Math.min(1, camera.aspect / 1.4))
      sign.scale.setScalar(k)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(mount)

    /* Petlja */
    const clock = new THREE.Clock()
    let raf = 0
    let lastFocused = -1
    const tick = () => {
      const t = clock.getElapsedTime()
      camX += (st.targetX - camX) * 0.08
      camera.position.x = camX
      camera.position.y = 1.9
      camera.lookAt(camX * 0.96, 2.0, -0.4)
      key.position.set(camX + 1.4, 5.0, 3.2)
      key.target.position.set(camX, 1.3, WALL_Z)
      key.target.updateMatrixWorld()

      let best = 0
      let bestD = Infinity
      st.items.forEach((it, i) => {
        const d = Math.abs(it.group.position.x - camX)
        if (d < bestD) {
          bestD = d
          best = i
        }
        /* ljuljanje */
        it.group.rotation.z = Math.sin(t * 1.1 + i * 0.8) * 0.018
        const s = d < 0.4 ? 1.08 : 1
        const cur = it.group.scale.x
        const ns = cur + (s - cur) * 0.12
        it.group.scale.setScalar(ns)
      })
      if (best !== lastFocused) {
        lastFocused = best
        setFocused(best)
      }
      if (stampMesh) stampMesh.rotation.z = t * 0.12
      renderer.render(scene, camera)
      raf = requestAnimationFrame(tick)
    }
    tick()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      el.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      el.removeEventListener('wheel', onWheel)
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose()
          const m = o.material
          const mats = Array.isArray(m) ? m : [m]
          mats.forEach((mm) => {
            const sm = mm as THREE.MeshStandardMaterial
            if (sm.map) sm.map.dispose()
            mm.dispose()
          })
        }
      })
      texCache.clear()
      renderer.dispose()
      mount.removeChild(renderer.domElement)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredKey, stamp])

  const focusedProduct =
    filtered.length > 0 ? filtered[Math.min(focused, filtered.length - 1)] : null

  const go = (dir: 1 | -1) => {
    const st = stateRef.current
    const i = Math.round(st.targetX / SPACING)
    st.setCam((i + dir) * SPACING)
  }

  const skeleton = loading && products.length === 0

  return (
    <section
      id="pocetna"
      className="relative overflow-hidden border-b border-border bg-[#ece5db]"
    >
      <div
        ref={mountRef}
        className="relative h-[62vh] min-h-[420px] w-full select-none md:h-[68vh]"
      />
      {skeleton && (
        <div className="absolute inset-0 flex h-[62vh] min-h-[420px] items-center justify-center text-muted-foreground md:h-[68vh]">
          Učitavam prodavnicu…
        </div>
      )}
      {!skeleton && filtered.length === 0 && (
        <div className="absolute inset-0 flex h-[62vh] min-h-[420px] items-center justify-center bg-[#ece5db] text-muted-foreground md:h-[68vh]">
          Nema artikala u ovom izboru — probaj drugu kategoriju.
        </div>
      )}

      {filtered.length > 1 && (
        <>
          <button
            className="btn-lift absolute left-3 top-[31vh] z-30 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card shadow-md md:flex"
            onClick={() => go(-1)}
            aria-label="Prethodni artikal"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            className="btn-lift absolute right-3 top-[31vh] z-30 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card shadow-md md:flex"
            onClick={() => go(1)}
            aria-label="Sledeći artikal"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Natpis ispod — fokusirani artikal */}
      <div className="relative mx-auto flex min-h-[8.5rem] max-w-2xl flex-col items-center justify-center px-4 py-4 text-center">
        {focusedProduct && (
          <div key={focusedProduct.id} className="card-enter">
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              <Badge variant="secondary">{focusedProduct.category}</Badge>
              {focusedProduct.gender && (
                <Badge variant="secondary">{focusedProduct.gender}</Badge>
              )}
              {focusedProduct.size && (
                <Badge variant="secondary">{focusedProduct.size}</Badge>
              )}
            </div>
            <p className="mt-2 font-display text-xl font-semibold md:text-2xl">
              {focusedProduct.name}
            </p>
            <p className="font-display text-xl font-bold text-primary md:text-2xl">
              {formatRsd(focusedProduct.price)}
            </p>
            <div className="mt-3 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="btn-lift"
                onClick={() => onView(focusedProduct)}
              >
                Detalji
              </Button>
              <Button
                size="sm"
                className="btn-lift"
                onClick={() => onAdd(focusedProduct)}
              >
                <ShoppingBasket className="mr-1 h-4 w-4" /> U korpu
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Filteri na dnu */}
      <div className="relative mx-auto max-w-4xl space-y-2.5 px-4 pb-10">
        {genders.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {['Sve', ...genders].map((g) => (
              <button
                key={g}
                onClick={() => onGenderChange(g)}
                className={`btn-lift rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
                  gender === g
                    ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                    : 'border-border bg-card hover:border-primary hover:text-primary'
                }`}
              >
                {g === 'Sve' ? 'Sva odeljenja' : g}
              </button>
            ))}
          </div>
        )}
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => onCategoryChange(c)}
              className={`btn-lift rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                category === c
                  ? 'border-accent bg-accent text-accent-foreground shadow-sm'
                  : 'border-border bg-card hover:border-accent hover:text-accent'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
