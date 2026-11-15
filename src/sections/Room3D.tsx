import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  ShoppingBasket,
  Trash2,
} from 'lucide-react'
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
  isAdmin?: boolean
  onCategoryChange: (c: string) => void
  onGenderChange: (g: string) => void
  onView: (p: Product) => void
  onAdd: (p: Product) => void
  onEdit?: (p: Product) => void
  onDelete?: (p: Product) => void
}

const ROOM_R = 4.6
const ROD_Y = 2.1
const ROD_OFF = 0.45
const GARMENT_W = 1.0
const GARMENT_H = 1.3

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
  ctx.fillText('V I R T U A L N A   P R O D A V N I C A', c.width / 2, 150)
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
  t.repeat.set(8, 8)
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

const wrapAngle = (a: number) => {
  while (a > Math.PI) a -= Math.PI * 2
  while (a < -Math.PI) a += Math.PI * 2
  return a
}

export default function Room3D({
  products,
  loading,
  genders,
  category,
  gender,
  stamp,
  isAdmin,
  onCategoryChange,
  onGenderChange,
  onView,
  onAdd,
  onEdit,
  onDelete,
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
    targetYaw: number
    targetPitch: number
    items: {
      group: THREE.Group
      product: Product
      hit: THREE.Mesh
      angle: number
    }[]
  }>({ targetYaw: 0, targetPitch: 0, items: [] })

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
    const el = renderer.domElement
    el.style.display = 'block'
    el.style.cursor = 'grab'
    el.style.touchAction = 'pan-y'

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#e7dfd2')

    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 40)
    camera.rotation.order = 'YXZ'
    camera.position.set(0, 1.65, 0)

    /* Svetlost */
    scene.add(new THREE.HemisphereLight(0xfff6ea, 0x8a7a68, 0.75))
    const sun = new THREE.DirectionalLight(0xfff1de, 1.5)
    sun.position.set(3, 7, 4)
    sun.castShadow = true
    sun.shadow.mapSize.set(2048, 2048)
    sun.shadow.camera.left = -7
    sun.shadow.camera.right = 7
    sun.shadow.camera.top = 7
    sun.shadow.camera.bottom = -7
    sun.shadow.camera.far = 25
    sun.shadow.bias = -0.0004
    sun.shadow.radius = 5
    scene.add(sun)

    /* Visilice */
    const lampXs = [-2.2, 0, 2.2]
    lampXs.forEach((lx) => {
      const lamp = new THREE.Group()
      const cord = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.008, 1.0, 6),
        new THREE.MeshStandardMaterial({ color: '#2b2b25' }),
      )
      cord.position.y = 3.7
      lamp.add(cord)
      const shade = new THREE.Mesh(
        new THREE.ConeGeometry(0.22, 0.22, 24, 1, true),
        new THREE.MeshStandardMaterial({
          color: '#2b2b25',
          roughness: 0.5,
          metalness: 0.6,
          side: THREE.DoubleSide,
        }),
      )
      shade.position.y = 3.2
      lamp.add(shade)
      const bulb = new THREE.PointLight(0xffe3c0, 10, 9, 2)
      bulb.position.y = 3.05
      lamp.add(bulb)
      lamp.position.x = lx
      scene.add(lamp)
    })

    /* Materijali sobe */
    const wallMat = new THREE.MeshStandardMaterial({
      color: '#e7dfd2',
      roughness: 0.95,
    })
    const metalMat = new THREE.MeshStandardMaterial({
      color: '#6b6b66',
      roughness: 0.35,
      metalness: 0.8,
    })

    /* Pod */
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(ROOM_R * 2, ROOM_R * 2),
      new THREE.MeshStandardMaterial({ map: floorTexture(), roughness: 0.75 }),
    )
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    scene.add(floor)

    /* Tepih */
    const rug = new THREE.Mesh(
      new THREE.CircleGeometry(1.7, 40),
      new THREE.MeshStandardMaterial({ color: '#a3462f', roughness: 1 }),
    )
    rug.rotation.x = -Math.PI / 2
    rug.position.y = 0.006
    rug.receiveShadow = true
    scene.add(rug)

    /* Plafon */
    const ceil = new THREE.Mesh(
      new THREE.PlaneGeometry(ROOM_R * 2, ROOM_R * 2),
      new THREE.MeshStandardMaterial({ color: '#efe9dd', roughness: 1 }),
    )
    ceil.rotation.x = Math.PI / 2
    ceil.position.y = 4.2
    scene.add(ceil)

    /* Zidovi: sever, istok, jug, zapad */
    const wallDefs = [
      { nx: 0, nz: -1, rotY: 0 }, // sever (z=-R)
      { nx: 1, nz: 0, rotY: -Math.PI / 2 }, // istok (x=+R)
      { nx: 0, nz: 1, rotY: Math.PI }, // jug (z=+R)
      { nx: -1, nz: 0, rotY: Math.PI / 2 }, // zapad (x=-R)
    ]
    wallDefs.forEach(({ nx, nz, rotY }) => {
      const wall = new THREE.Mesh(
        new THREE.PlaneGeometry(ROOM_R * 2, 4.2),
        wallMat,
      )
      wall.rotation.y = rotY
      wall.position.set(nx * ROOM_R, 2.1, nz * ROOM_R)
      wall.receiveShadow = true
      scene.add(wall)
      /* sokla */
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(ROOM_R * 2, 0.12, 0.03),
        new THREE.MeshStandardMaterial({ color: '#d3c9b8', roughness: 0.9 }),
      )
      base.rotation.y = rotY
      base.position.set(
        nx * (ROOM_R - 0.015),
        0.06,
        nz * (ROOM_R - 0.015),
      )
      scene.add(base)
      /* šipka za odeću */
      const rodLen = ROOM_R * 2 - 1.2
      const rod = new THREE.Mesh(
        new THREE.CylinderGeometry(0.016, 0.016, rodLen, 12),
        metalMat,
      )
      rod.rotation.z = Math.PI / 2
      rod.rotation.y = rotY
      const rodX = nx * (ROOM_R - ROD_OFF)
      const rodZ = nz * (ROOM_R - ROD_OFF)
      rod.position.set(rodX, ROD_Y, rodZ)
      rod.castShadow = true
      scene.add(rod)
      /* nosači šipke */
      ;[-rodLen / 2 + 0.15, 0, rodLen / 2 - 0.15].forEach((s) => {
        const mount = new THREE.Mesh(
          new THREE.CylinderGeometry(0.012, 0.012, ROD_OFF, 8),
          metalMat,
        )
        /* od zida do šipke */
        const mx = nx === 0 ? s : ROOM_R - ROD_OFF / 2
        const mz = nz === 0 ? s : ROOM_R - ROD_OFF / 2
        mount.position.set(nx !== 0 ? nx * mx : mx, ROD_Y, nz !== 0 ? nz * mz : mz)
        mount.rotation.x = nz !== 0 ? Math.PI / 2 : 0
        mount.rotation.z = nx !== 0 ? Math.PI / 2 : 0
        scene.add(mount)
      })
    })

    /* Natpis na severnom zidu */
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(4.6, 1.44),
      new THREE.MeshBasicMaterial({ map: signTexture(), transparent: true }),
    )
    sign.position.set(0, 3.35, -ROOM_R + 0.02)
    scene.add(sign)

    /* Pečat na istočnom zidu */
    let stampMesh: THREE.Mesh | null = null
    if (stamp) {
      stampMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(0.85, 0.85),
        new THREE.MeshBasicMaterial({
          map: stampTexture(stamp),
          transparent: true,
        }),
      )
      stampMesh.rotation.y = -Math.PI / 2
      stampMesh.position.set(ROOM_R - 0.02, 3.15, 1.4)
      scene.add(stampMesh)
    }

    /* Artikli — raspoređeni po zidovima */
    const texCache = new Map<string, THREE.Texture>()
    const loader = new THREE.TextureLoader()
    loader.crossOrigin = 'anonymous'
    const itemRoot = new THREE.Group()
    scene.add(itemRoot)

    const st = stateRef.current
    st.items = []

    const perWall: Product[][] = [[], [], [], []]
    filtered.forEach((p, i) => perWall[i % 4].push(p))

    const usable = ROOM_R * 2 - 1.8
    perWall.forEach((list, w) => {
      const { nx, nz, rotY } = wallDefs[w]
      const count = list.length
      const spacing = count > 1 ? Math.min(1.6, usable / (count - 1)) : 0
      list.forEach((p, j) => {
        const s = count > 1 ? -((count - 1) * spacing) / 2 + j * spacing : 0
        const px = nx !== 0 ? nx * (ROOM_R - ROD_OFF) : s
        const pz = nz !== 0 ? nz * (ROOM_R - ROD_OFF) : s

        const group = new THREE.Group()
        group.position.set(px, ROD_Y, pz)
        group.rotation.y = rotY

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
        garment.userData.productIndex = st.items.length
        group.add(garment)

        itemRoot.add(group)
        st.items.push({
          group,
          product: p,
          hit: garment,
          angle: Math.atan2(-px, -pz),
        })
      })
    })

    /* Kamera — okretanje u krug */
    let yaw = 0
    let pitch = 0
    st.targetYaw = 0
    st.targetPitch = 0
    setFocused(0)

    let dragging = false
    let downX = 0
    let downY = 0
    let startYaw = 0
    let startPitch = 0
    let moved = 0
    const pxToAngle = () => {
      const w = mount.clientWidth
      const hf = 2 * Math.atan(
        Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect,
      )
      return hf / w
    }
    const onDown = (e: PointerEvent) => {
      dragging = true
      moved = 0
      downX = e.clientX
      downY = e.clientY
      startYaw = st.targetYaw
      startPitch = st.targetPitch
      el.style.cursor = 'grabbing'
    }
    const onMove = (e: PointerEvent) => {
      if (!dragging) return
      const dx = e.clientX - downX
      const dy = e.clientY - downY
      moved = Math.max(moved, Math.abs(dx) + Math.abs(dy) * 0.3)
      st.targetYaw = startYaw - dx * pxToAngle()
      st.targetPitch = Math.max(
        -0.28,
        Math.min(0.22, startPitch - dy * pxToAngle() * 0.6),
      )
    }
    const onUp = (e: PointerEvent) => {
      if (!dragging) return
      dragging = false
      el.style.cursor = 'grab'
      if (moved < 6) {
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
    el.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)

    /* Veličina */
    const resize = () => {
      const w = mount.clientWidth
      const h = mount.clientHeight
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
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
      yaw += wrapAngle(st.targetYaw - yaw) * 0.09
      pitch += (st.targetPitch - pitch) * 0.09
      camera.rotation.y = yaw
      camera.rotation.x = pitch

      let best = 0
      let bestD = Infinity
      st.items.forEach((it, i) => {
        const d = Math.abs(wrapAngle(it.angle - yaw))
        if (d < bestD) {
          bestD = d
          best = i
        }
        it.group.rotation.z = Math.sin(t * 1.1 + i * 0.8) * 0.018
        const target = d < 0.18 ? 1.07 : 1
        const cur = it.group.scale.x
        it.group.scale.setScalar(cur + (target - cur) * 0.12)
      })
      if (best !== lastFocused && st.items.length) {
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
      mount.removeChild(el)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredKey, stamp])

  const focusedProduct =
    stateRef.current.items.length > 0
      ? stateRef.current.items[
          Math.min(focused, stateRef.current.items.length - 1)
        ].product
      : null

  const go = (dir: 1 | -1) => {
    const st = stateRef.current
    if (!st.items.length) return
    const angles = [...st.items].map((it) => it.angle).sort((a, b) => a - b)
    const cur = wrapAngle(st.targetYaw)
    let next: number
    if (dir > 0) {
      next =
        angles.find((a) => a > cur + 0.02) ?? angles[0] + Math.PI * 2
    } else {
      next =
        [...angles].reverse().find((a) => a < cur - 0.02) ??
        angles[angles.length - 1] - Math.PI * 2
    }
    st.targetYaw = cur + wrapAngle(next - cur)
  }

  const skeleton = loading && products.length === 0

  return (
    <section
      id="pocetna"
      className="relative overflow-hidden border-b border-border bg-[#e7dfd2]"
    >
      <div
        ref={mountRef}
        className="h-[calc(100dvh-4rem)] min-h-[540px] w-full select-none"
      />

      {(skeleton || filtered.length === 0) && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[#e7dfd2] text-muted-foreground">
          {skeleton
            ? 'Učitavam prodavnicu…'
            : 'Nema artikala u ovom izboru — probaj drugu kategoriju.'}
        </div>
      )}

      {filtered.length > 1 && (
        <>
          <button
            className="btn-lift absolute left-3 top-1/2 z-30 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/90 shadow-md md:flex"
            onClick={() => go(-1)}
            aria-label="Prethodni artikal"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            className="btn-lift absolute right-3 top-1/2 z-30 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/90 shadow-md md:flex"
            onClick={() => go(1)}
            aria-label="Sledeći artikal"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Donja traka: fokusirani artikal + filteri */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#e7dfd2] via-[#e7dfd2]/85 to-transparent pb-3 pt-6">
        <div className="mx-auto flex min-h-[6.5rem] max-w-2xl flex-col items-center justify-center px-4 text-center">
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
              <p className="mt-1 font-display text-lg font-semibold md:text-xl">
                {focusedProduct.name} —{' '}
                <span className="font-bold text-primary">
                  {formatRsd(focusedProduct.price)}
                </span>
              </p>
              <div className="pointer-events-auto mt-2 flex items-center justify-center gap-2">
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
                {isAdmin && onEdit && onDelete && (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="btn-lift"
                      onClick={() => onEdit(focusedProduct)}
                    >
                      <Pencil className="mr-1 h-4 w-4" /> Izmeni
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="btn-lift"
                      onClick={() => onDelete(focusedProduct)}
                    >
                      <Trash2 className="mr-1 h-4 w-4" /> Obriši
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="pointer-events-auto mx-auto max-w-4xl space-y-2 px-4">
          {genders.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              {['Sve', ...genders].map((g) => (
                <button
                  key={g}
                  onClick={() => onGenderChange(g)}
                  className={`btn-lift rounded-full border px-3.5 py-1 text-sm font-semibold transition-colors ${
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
                className={`btn-lift rounded-full border px-3.5 py-1 text-sm font-medium transition-colors ${
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
      </div>
    </section>
  )
}
