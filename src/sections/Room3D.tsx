import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  ShoppingBasket,
  Trash2,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Product } from '@/types'
import { formatRsd } from '@/lib/format'

interface Props {
  products: Product[]
  loading?: boolean
  category: string
  gender: string
  isAdmin?: boolean
  onAdd: (p: Product) => void
  onEdit?: (p: Product) => void
  onDelete?: (p: Product) => void
}

const ROOM_R = 6.0
const ROD_Y = 2.1
const ROD_OFF = 0.45
const GARMENT_W = 1.0
const GARMENT_H = 1.35

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

/* Svetleci natpis SEKUND */
function signTexture() {
  const c = document.createElement('canvas')
  c.width = 2048
  c.height = 512
  const ctx = c.getContext('2d')!
  ctx.clearRect(0, 0, c.width, c.height)
  ctx.textAlign = 'center'
  ctx.shadowColor = '#ffdf9e'
  ctx.shadowBlur = 46
  ctx.fillStyle = '#ffedc9'
  ctx.font = '700 330px Georgia, serif'
  ctx.fillText('SEKUND', c.width / 2, 390)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  return t
}

/* Zid — fina tekstura maltera */
function plasterTexture() {
  const S = 256
  const c = document.createElement('canvas')
  c.width = S
  c.height = S
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#3d3831'
  ctx.fillRect(0, 0, S, S)
  for (let i = 0; i < 2600; i++) {
    const x = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1
    const y = Math.abs(Math.sin(i * 78.233) * 12543.1234) % 1
    const v = Math.abs(Math.sin(i * 3.7) * 97531.33) % 1
    ctx.fillStyle = v > 0.5 ? 'rgba(255,245,230,0.025)' : 'rgba(0,0,0,0.05)'
    ctx.fillRect(x * S, y * S, 2, 2)
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.wrapS = THREE.RepeatWrapping
  t.wrapT = THREE.RepeatWrapping
  t.repeat.set(6, 2)
  return t
}

/* Parket — riblja kost */
function floorTexture() {
  const S = 512
  const c = document.createElement('canvas')
  c.width = S
  c.height = S
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#6e5138'
  ctx.fillRect(0, 0, S, S)
  const tones = ['#7d5f41', '#75573b', '#836546', '#6f5238', '#866a4b']
  let k = 0
  for (let y = -64; y < S + 64; y += 64) {
    for (let x = -64; x < S + 64; x += 64) {
      /* dve daske pod ±45° — riblja kost */
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(Math.PI / 4)
      ctx.fillStyle = tones[k++ % tones.length]
      ctx.fillRect(-48, -11, 96, 22)
      ctx.strokeStyle = 'rgba(30,20,12,0.55)'
      ctx.lineWidth = 2
      ctx.strokeRect(-48, -11, 96, 22)
      ctx.fillStyle = 'rgba(255,240,220,0.05)'
      ctx.fillRect(-48, -11, 96, 5)
      ctx.restore()
      ctx.save()
      ctx.translate(x + 32, y + 32)
      ctx.rotate(-Math.PI / 4)
      ctx.fillStyle = tones[k++ % tones.length]
      ctx.fillRect(-48, -11, 96, 22)
      ctx.strokeStyle = 'rgba(30,20,12,0.55)'
      ctx.lineWidth = 2
      ctx.strokeRect(-48, -11, 96, 22)
      ctx.fillStyle = 'rgba(255,240,220,0.05)'
      ctx.fillRect(-48, -11, 96, 5)
      ctx.restore()
    }
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.wrapS = THREE.RepeatWrapping
  t.wrapT = THREE.RepeatWrapping
  t.repeat.set(7, 7)
  t.anisotropy = 8
  return t
}

/* Drvena vešalica: metalna kuka + drveni ram sa ramenima */
function createHanger() {
  const g = new THREE.Group()
  const metal = new THREE.MeshStandardMaterial({
    color: '#9a958a',
    roughness: 0.3,
    metalness: 0.85,
  })
  const wood = new THREE.MeshStandardMaterial({
    color: '#8a5a34',
    roughness: 0.55,
  })
  const hook = new THREE.Mesh(
    new THREE.TorusGeometry(0.055, 0.011, 10, 24, Math.PI),
    metal,
  )
  hook.position.y = -0.028
  g.add(hook)
  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.011, 0.011, 0.07, 8),
    metal,
  )
  neck.position.y = -0.1
  g.add(neck)
  /* ramena — dve nagnute drvene letve */
  const armL = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.014, GARMENT_W * 0.52, 10),
    wood,
  )
  armL.rotation.z = Math.PI / 2 - 0.32
  armL.position.set(-GARMENT_W * 0.235, -0.19, 0)
  armL.castShadow = true
  g.add(armL)
  const armR = armL.clone()
  armR.rotation.z = Math.PI / 2 + 0.32
  armR.position.x = GARMENT_W * 0.235
  g.add(armR)
  /* poprečna letva */
  const bar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.014, 0.014, GARMENT_W * 0.82, 10),
    wood,
  )
  bar.rotation.z = Math.PI / 2
  bar.position.y = -0.34
  g.add(bar)
  return g
}

/* Odeća — silueta sa ramenima, ne običan pravougaonik */
function garmentGeometry() {
  const hw = GARMENT_W / 2
  const s = new THREE.Shape()
  s.moveTo(-hw * 0.84, 0)
  s.lineTo(hw * 0.84, 0)
  s.lineTo(hw * 1.04, -0.22)
  s.lineTo(hw, -GARMENT_H)
  s.lineTo(-hw, -GARMENT_H)
  s.lineTo(-hw * 1.04, -0.22)
  s.closePath()
  const geo = new THREE.ShapeGeometry(s, 4)
  /* UV mapiranje na 0-1 */
  const pos = geo.attributes.position
  const uv = geo.attributes.uv
  for (let i = 0; i < pos.count; i++) {
    uv.setXY(
      i,
      (pos.getX(i) + hw * 1.04) / (hw * 2.08),
      1 + pos.getY(i) / GARMENT_H,
    )
  }
  return geo
}

const wrapAngle = (a: number) => {
  while (a > Math.PI) a -= Math.PI * 2
  while (a < -Math.PI) a += Math.PI * 2
  return a
}

interface Item {
  group: THREE.Group
  product: Product
  hit: THREE.Mesh
  angle: number
  lampMat: THREE.MeshStandardMaterial
  lampAnchor: THREE.Vector3
  basePos: THREE.Vector3
  inward: THREE.Vector3
  baseRot: number
  faceRot: number
  anim: number
}

export default function Room3D({
  products,
  loading,
  category,
  gender,
  isAdmin,
  onAdd,
  onEdit,
  onDelete,
}: Props) {
  const mountRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<number>(-1)

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
    hover: number
    pinned: number
    focus: number
    panelHover: boolean
    items: Item[]
  }>({ targetYaw: 0, targetPitch: -0.1, hover: -1, pinned: -1, focus: 0, panelHover: false, items: [] })

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
    scene.background = new THREE.Color('#2a2620')

    const camera = new THREE.PerspectiveCamera(62, 1, 0.1, 40)
    camera.rotation.order = 'YXZ'
    camera.position.set(0, 1.8, 0)

    /* Bazno svetlo — prigušeno */
    scene.add(new THREE.HemisphereLight(0xbfae98, 0x1e1a16, 0.62))
    const sun = new THREE.DirectionalLight(0xffe8cc, 0.4)
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

    /* Visilice na plafonu — prijatno prigušene */
    ;[-2.2, 0, 2.2].forEach((lx) => {
      const lamp = new THREE.Group()
      const cord = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.008, 1.0, 6),
        new THREE.MeshStandardMaterial({ color: '#16130f' }),
      )
      cord.position.y = 3.7
      lamp.add(cord)
      const shade = new THREE.Mesh(
        new THREE.ConeGeometry(0.22, 0.22, 24, 1, true),
        new THREE.MeshStandardMaterial({
          color: '#16130f',
          roughness: 0.5,
          metalness: 0.6,
          side: THREE.DoubleSide,
        }),
      )
      shade.position.y = 3.2
      lamp.add(shade)
      const bulb = new THREE.PointLight(0xffe3c0, 5, 9, 2)
      bulb.position.y = 3.05
      lamp.add(bulb)
      lamp.position.x = lx
      scene.add(lamp)
    })

    /* Reflektor koji prati aktivan artikal */
    const spot = new THREE.SpotLight(0xffe2b8, 0, 6, 0.5, 0.55, 1.4)
    spot.castShadow = true
    spot.shadow.mapSize.set(1024, 1024)
    spot.shadow.bias = -0.0004
    const spotTarget = new THREE.Object3D()
    scene.add(spot, spotTarget)
    spot.target = spotTarget
    /* vidljivi konus svetla */
    const coneMat = new THREE.MeshBasicMaterial({
      color: '#ffd9a0',
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const lightCone = new THREE.Mesh(
      new THREE.ConeGeometry(0.62, 1.75, 24, 1, true),
      coneMat,
    )
    lightCone.visible = false
    scene.add(lightCone)

    /* Materijali sobe — tamna butik atmosfera */
    const wallMat = new THREE.MeshStandardMaterial({
      map: plasterTexture(),
      roughness: 0.95,
    })
    const metalMat = new THREE.MeshStandardMaterial({
      color: '#8a8578',
      roughness: 0.35,
      metalness: 0.8,
    })

    /* Pod — parket */
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(ROOM_R * 2, ROOM_R * 2),
      new THREE.MeshStandardMaterial({
        map: floorTexture(),
        roughness: 0.45,
        metalness: 0.08,
      }),
    )
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    scene.add(floor)

    /* Tepih */
    const rug = new THREE.Mesh(
      new THREE.CircleGeometry(1.7, 40),
      new THREE.MeshStandardMaterial({ color: '#7d3b2a', roughness: 1 }),
    )
    rug.rotation.x = -Math.PI / 2
    rug.position.y = 0.006
    rug.receiveShadow = true
    scene.add(rug)

    /* Plafon */
    const ceil = new THREE.Mesh(
      new THREE.PlaneGeometry(ROOM_R * 2, ROOM_R * 2),
      new THREE.MeshStandardMaterial({ color: '#2a2620', roughness: 1 }),
    )
    ceil.rotation.x = Math.PI / 2
    ceil.position.y = 4.2
    scene.add(ceil)

    /* Zidovi: sever, istok, jug, zapad */
    const wallDefs = [
      { nx: 0, nz: -1, rotY: 0 },
      { nx: 1, nz: 0, rotY: -Math.PI / 2 },
      { nx: 0, nz: 1, rotY: Math.PI },
      { nx: -1, nz: 0, rotY: Math.PI / 2 },
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
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(ROOM_R * 2, 0.12, 0.03),
        new THREE.MeshStandardMaterial({ color: '#575046', roughness: 0.9 }),
      )
      base.rotation.y = rotY
      base.position.set(nx * (ROOM_R - 0.015), 0.06, nz * (ROOM_R - 0.015))
      scene.add(base)
      const rodLen = ROOM_R * 2 - 1.2
      const rod = new THREE.Mesh(
        new THREE.CylinderGeometry(0.016, 0.016, rodLen, 12),
        metalMat,
      )
      rod.rotation.z = Math.PI / 2
      rod.rotation.y = rotY
      rod.position.set(nx * (ROOM_R - ROD_OFF), ROD_Y, nz * (ROOM_R - ROD_OFF))
      rod.castShadow = true
      scene.add(rod)
      ;[-rodLen / 2 + 0.15, 0, rodLen / 2 - 0.15].forEach((s) => {
        const m = new THREE.Mesh(
          new THREE.CylinderGeometry(0.012, 0.012, ROD_OFF, 8),
          metalMat,
        )
        const mx = nx === 0 ? s : ROOM_R - ROD_OFF / 2
        const mz = nz === 0 ? s : ROOM_R - ROD_OFF / 2
        m.position.set(nx !== 0 ? nx * mx : mx, ROD_Y, nz !== 0 ? nz * mz : mz)
        m.rotation.x = nz !== 0 ? Math.PI / 2 : 0
        m.rotation.z = nx !== 0 ? Math.PI / 2 : 0
        scene.add(m)
      })
    })

    /* Reflektori na plafonskoj šini duž svake šipke */
    wallDefs.forEach(({ nx, nz, rotY }) => {
      const trackLen = ROOM_R * 2 - 2.2
      const track = new THREE.Mesh(
        new THREE.BoxGeometry(trackLen, 0.035, 0.035),
        new THREE.MeshStandardMaterial({ color: '#16130f', roughness: 0.6 }),
      )
      track.rotation.y = rotY
      track.position.set(nx * (ROOM_R - 0.95), 3.85, nz * (ROOM_R - 0.95))
      scene.add(track)
      const headMat = new THREE.MeshStandardMaterial({
        color: '#16130f',
        roughness: 0.5,
        metalness: 0.6,
        emissive: '#ffca7a',
        emissiveIntensity: 0.55,
      })
      const n = 4
      for (let i = 0; i < n; i++) {
        const s = -trackLen / 2 + (trackLen / (n - 1)) * i
        const head = new THREE.Mesh(
          new THREE.CylinderGeometry(0.035, 0.05, 0.14, 12),
          headMat,
        )
        /* glava nagnuta ka šipci sa odećom */
        head.rotation.x = nz !== 0 ? nz * 0.7 : 0
        head.rotation.z = nx !== 0 ? -nx * 0.7 : 0
        head.position.set(
          nx !== 0 ? nx * (ROOM_R - 0.95) : s,
          3.78,
          nz !== 0 ? nz * (ROOM_R - 0.95) : s,
        )
        scene.add(head)
      }
      /* toplo svetlo koje pere odeću na tom zidu */
      const wash = new THREE.PointLight(0xffd9a8, 3.2, 7, 2)
      wash.position.set(nx * (ROOM_R - 1.1), 3.1, nz * (ROOM_R - 1.1))
      scene.add(wash)
    })

    /* Svetleci natpis SEKUND na sredini svakog zida */
    const signTex = signTexture()
    const signMat = new THREE.MeshBasicMaterial({
      map: signTex,
      transparent: true,
    })
    const signs: THREE.Mesh[] = []
    wallDefs.forEach(({ nx, nz, rotY }) => {
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 1.05), signMat)
      sign.rotation.y = rotY
      sign.position.set(nx * (ROOM_R - 0.03), 3.4, nz * (ROOM_R - 0.03))
      scene.add(sign)
      signs.push(sign)
    })

    /* Artikli — raspoređeni po zidovima */
    const texCache = new Map<string, THREE.Texture>()
    const loader = new THREE.TextureLoader()
    loader.crossOrigin = 'anonymous'
    const itemRoot = new THREE.Group()
    scene.add(itemRoot)
    const geo = garmentGeometry()

    const st = stateRef.current
    st.items = []
    st.hover = -1
    st.pinned = -1
    st.focus = 0

    const perWall: Product[][] = [[], [], [], []]
    filtered.forEach((p, i) => perWall[i % 4].push(p))

    const usable = ROOM_R * 2 - 1.8
    perWall.forEach((list, w) => {
      const { nx, nz, rotY } = wallDefs[w]
      const count = list.length
      /* na stenderu stvari vise jedna do druge, leđa uz leđa */
      const spacing = count > 1 ? Math.min(0.6, usable / (count - 1)) : 0
      list.forEach((p, j) => {
        const s = count > 1 ? -((count - 1) * spacing) / 2 + j * spacing : 0
        const px = nx !== 0 ? nx * (ROOM_R - ROD_OFF) : s
        const pz = nz !== 0 ? nz * (ROOM_R - ROD_OFF) : s

        const group = new THREE.Group()
        group.position.set(px, ROD_Y, pz)
        /* okrenuto bočno — kao na pravom stenderu */
        group.rotation.y = rotY + Math.PI / 2

        group.add(createHanger())
        /* vešalica malo izađe ka prostoriji da prati ramena odeće */
        group.children[0].position.x = 0.22

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
          alphaTest: 0.08,
        })
        const garment = new THREE.Mesh(geo, mat)
        garment.position.set(0.4, -0.13, 0.03)
        garment.castShadow = true
        group.add(garment)

        /* nevidljiva zona za miš — lako se „uhvati" i uski profil */
        const hit = new THREE.Mesh(
          new THREE.BoxGeometry(GARMENT_W + 0.2, GARMENT_H + 0.35, 0.5),
          new THREE.MeshBasicMaterial({
            colorWrite: false,
            depthWrite: false,
          }),
        )
        hit.position.set(0.4, -GARMENT_H / 2 - 0.05, 0)
        hit.userData.itemIndex = st.items.length
        group.add(hit)

        itemRoot.add(group)

        /* Lampica iznad artikla (ugasena dok ne priđeš) */
        const lampMat = new THREE.MeshStandardMaterial({
          color: '#16130f',
          roughness: 0.5,
          metalness: 0.6,
          emissive: '#ffca7a',
          emissiveIntensity: 0,
        })
        const lampG = new THREE.Group()
        const cord = new THREE.Mesh(
          new THREE.CylinderGeometry(0.006, 0.006, 0.85, 6),
          new THREE.MeshStandardMaterial({ color: '#16130f' }),
        )
        cord.position.y = 0.6
        lampG.add(cord)
        const shade = new THREE.Mesh(
          new THREE.ConeGeometry(0.11, 0.13, 20, 1, true),
          lampMat,
        )
        lampG.add(shade)
        lampG.position.set(px + -nx * 0.55, ROD_Y + 1.05, pz + -nz * 0.55)
        scene.add(lampG)

        st.items.push({
          group,
          product: p,
          hit,
          angle: Math.atan2(-px, -pz),
          lampMat,
          lampAnchor: new THREE.Vector3(
            px + -nx * 0.55,
            ROD_Y + 0.95,
            pz + -nz * 0.55,
          ),
          basePos: group.position.clone(),
          inward: new THREE.Vector3(-nx, 0, -nz),
          baseRot: rotY + Math.PI / 2,
          faceRot: rotY,
          anim: 0,
        })
      })
    })

    /* Kamera */
    let yaw = 0
    let pitch = -0.1
    st.targetYaw = 0
    st.targetPitch = -0.1
    setActive(-1)

    let dragging = false
    let downX = 0
    let downY = 0
    let startYaw = 0
    let startPitch = 0
    let moved = 0
    const pxToAngle = () => {
      const w = mount.clientWidth
      const hf =
        2 *
        Math.atan(
          Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect,
        )
      return hf / w
    }

    const ray = new THREE.Raycaster()
    const pick = (cx: number, cy: number) => {
      const r = el.getBoundingClientRect()
      const ndc = new THREE.Vector2(
        ((cx - r.left) / r.width) * 2 - 1,
        -((cy - r.top) / r.height) * 2 + 1,
      )
      ray.setFromCamera(ndc, camera)
      const hits = ray.intersectObjects(
        st.items.map((it) => it.hit),
        false,
      )
      return hits.length
        ? (hits[0].object.userData.itemIndex as number)
        : -1
    }

    /* Drag: levo → soba u levo */
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
      if (dragging) {
        const dx = e.clientX - downX
        const dy = e.clientY - downY
        moved = Math.max(moved, Math.abs(dx) + Math.abs(dy) * 0.3)
        st.targetYaw = startYaw + dx * pxToAngle()
        st.targetPitch = Math.max(
          -0.28,
          Math.min(0.22, startPitch - dy * pxToAngle() * 0.6),
        )
        return
      }
      /* hover — lampa i prozorčić prate miša */
      if (e.pointerType === 'mouse') {
        st.hover = pick(e.clientX, e.clientY)
      }
    }
    const onUp = (e: PointerEvent) => {
      if (!dragging) return
      dragging = false
      el.style.cursor = 'grab'
      if (moved < 6) {
        const idx = pick(e.clientX, e.clientY)
        /* klik na isti artikal ga otkačinje, klik pored zatvara */
        st.pinned = idx >= 0 ? (st.pinned === idx ? -1 : idx) : -1
        if (idx < 0 || st.pinned < 0) setActive(-1)
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
      signs.forEach((sg) => sg.scale.setScalar(k))
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(mount)

    /* Petlja */
    const clock = new THREE.Clock()
    let raf = 0
    let lastActive = -2
    const tmpV = new THREE.Vector3()
    const tick = () => {
      const t = clock.getElapsedTime()
      yaw += wrapAngle(st.targetYaw - yaw) * 0.09
      pitch += (st.targetPitch - pitch) * 0.09
      camera.rotation.y = yaw
      camera.rotation.x = pitch

      /* najbliži pogledu */
      let focus = 0
      let bestD = Infinity
      st.items.forEach((it, i) => {
        const d = Math.abs(wrapAngle(it.angle - yaw))
        if (d < bestD) {
          bestD = d
          focus = i
        }
      })
      st.focus = focus

      /* lampa: hover ili fokus */
      const lampIdx =
        st.pinned >= 0 ? st.pinned : st.hover >= 0 ? st.hover : focus
      /* prozorčić: samo na klik, ili dok je miš na njemu */
      let panelIdx = st.pinned >= 0 ? st.pinned : -1
      if (panelIdx < 0 && st.panelHover && lastActive >= 0) panelIdx = lastActive
      if (panelIdx !== lastActive) {
        lastActive = panelIdx
        setActive(st.items.length ? panelIdx : -1)
      }

      /* lampe + animacija „skidanja sa stendera" */
      st.items.forEach((it, i) => {
        const on = i === lampIdx
        it.lampMat.emissiveIntensity +=
          ((on ? 1.4 : 0) - it.lampMat.emissiveIntensity) * 0.15
        const picked = i === st.hover || i === st.pinned
        it.anim += ((picked ? 1 : 0) - it.anim) * 0.14
        const a = it.anim
        /* vešalica se skine sa šipke, izađe napred i okrene ka tebi */
        it.group.position.set(
          it.basePos.x + it.inward.x * 1.15 * a,
          it.basePos.y + 0.3 * a,
          it.basePos.z + it.inward.z * 1.15 * a,
        )
        it.group.rotation.y =
          it.baseRot + wrapAngle(it.faceRot - it.baseRot) * a
        it.group.rotation.z = Math.sin(t * 1.1 + i * 0.8) * 0.02 * (1 - a)
        it.group.scale.setScalar(1 + 0.1 * a)
      })
      if (st.items.length && lampIdx >= 0) {
        const it = st.items[lampIdx]
        spot.position.copy(it.lampAnchor)
        it.hit.getWorldPosition(tmpV)
        spotTarget.position.copy(tmpV)
        spotTarget.updateMatrixWorld()
        spot.intensity += (36 - spot.intensity) * 0.1
        lightCone.visible = true
        lightCone.position.set(
          it.lampAnchor.x,
          it.lampAnchor.y - 1.0,
          it.lampAnchor.z,
        )
        coneMat.opacity += (0.07 - coneMat.opacity) * 0.1
      } else {
        spot.intensity += (0 - spot.intensity) * 0.1
        coneMat.opacity += (0 - coneMat.opacity) * 0.1
        if (coneMat.opacity < 0.005) lightCone.visible = false
      }

      /* pozicija prozorčića sa podacima */
      const panel = panelRef.current
      if (panel && st.items.length && panelIdx >= 0) {
        const it = st.items[panelIdx]
        it.hit.getWorldPosition(tmpV)
        tmpV.y += 0.15
        tmpV.project(camera)
        const w = mount.clientWidth
        const h = mount.clientHeight
        const sx = ((tmpV.x + 1) / 2) * w
        const sy = ((1 - tmpV.y) / 2) * h
        const pw = panel.offsetWidth
        const onRight = sx < w * 0.55
        panel.style.left = `${Math.max(8, Math.min(w - pw - 8, onRight ? sx + 52 : sx - pw - 52))}px`
        panel.style.top = `${Math.max(8, Math.min(h - 40, sy - 70))}px`
        panel.style.opacity = tmpV.z < 1 ? '1' : '0'
      } else if (panel) {
        panel.style.opacity = '0'
      }

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
  }, [filteredKey])

  const activeProduct =
    active >= 0 && stateRef.current.items[active]
      ? stateRef.current.items[active].product
      : null

  const go = (dir: 1 | -1) => {
    const st = stateRef.current
    if (!st.items.length) return
    const angles = [...st.items].map((it) => it.angle).sort((a, b) => a - b)
    const cur = wrapAngle(st.targetYaw)
    let next: number
    if (dir > 0) {
      next = angles.find((a) => a > cur + 0.02) ?? angles[0] + Math.PI * 2
    } else {
      next =
        [...angles].reverse().find((a) => a < cur - 0.02) ??
        angles[angles.length - 1] - Math.PI * 2
    }
    st.targetYaw = cur + wrapAngle(next - cur)
    st.pinned = -1
  }

  const skeleton = loading && products.length === 0

  return (
    <section
      id="pocetna"
      className="relative overflow-hidden bg-[#2a2620]"
    >
      <div
        ref={mountRef}
        className="h-[calc(100dvh-4rem)] min-h-[540px] w-full select-none"
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 58%, rgba(0,0,0,0.32) 100%)',
        }}
        aria-hidden
      />

      {(skeleton || filtered.length === 0) && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[#2a2620] text-white/60">
          {skeleton
            ? 'Učitavam prodavnicu…'
            : 'Nema artikala u ovom izboru — probaj drugi izbor u meniju Prodavnica.'}
        </div>
      )}

      {filtered.length > 1 && (
        <>
          <button
            className="btn-lift absolute left-3 top-1/2 z-30 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/90 shadow-md md:flex"
            onClick={() => go(1)}
            aria-label="Prethodni artikal"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            className="btn-lift absolute right-3 top-1/2 z-30 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/90 shadow-md md:flex"
            onClick={() => go(-1)}
            aria-label="Sledeći artikal"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Mali prozorčić pored artikla */}
      <div
        ref={panelRef}
        className="pointer-events-none absolute z-30 w-60 transition-opacity duration-200"
        style={{ opacity: 0 }}
        onMouseEnter={() => {
          stateRef.current.panelHover = true
        }}
        onMouseLeave={() => {
          stateRef.current.panelHover = false
        }}
      >
        {activeProduct && (
          <div className="pointer-events-auto overflow-hidden rounded-2xl border border-white/15 bg-[#231f1a]/95 text-[#f2ece1] shadow-[0_18px_50px_-12px_rgba(0,0,0,0.8)] backdrop-blur-md">
            {(activeProduct.images?.[0] || activeProduct.imageUrl) && (
              <div className="relative">
                <img
                  src={activeProduct.images?.[0] || activeProduct.imageUrl}
                  alt={activeProduct.name}
                  className="h-32 w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#231f1a]/70 to-transparent" />
              </div>
            )}
            <div className="p-3.5">
              <div className="flex items-start justify-between gap-2">
                <p className="font-display text-base font-semibold leading-tight">
                  {activeProduct.name}
                </p>
                <button
                  onClick={() => {
                    stateRef.current.pinned = -1
                    stateRef.current.panelHover = false
                    setActive(-1)
                  }}
                  className="mt-0.5 shrink-0 text-white/50 transition-colors hover:text-white"
                  aria-label="Zatvori"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1">
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-medium">
                  {activeProduct.category}
                </span>
                {activeProduct.gender && (
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-medium">
                    {activeProduct.gender}
                  </span>
                )}
                {activeProduct.size && (
                  <span className="rounded-full bg-[#d98a63]/25 px-2 py-0.5 text-[11px] font-semibold text-[#f0b98f]">
                    Vel. {activeProduct.size}
                  </span>
                )}
              </div>
              {activeProduct.description && (
                <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-white/65">
                  {activeProduct.description}
                </p>
              )}
              <p className="mt-2.5 font-display text-xl font-bold text-[#f0b98f]">
                {formatRsd(activeProduct.price)}
              </p>
              <Button
                size="sm"
                className="btn-lift mt-2.5 h-9 w-full text-xs font-semibold"
                onClick={() => onAdd(activeProduct)}
              >
                <ShoppingBasket className="mr-1.5 h-3.5 w-3.5" /> Dodaj u korpu
              </Button>
              {isAdmin && onEdit && onDelete && (
                <div className="mt-1.5 flex gap-1.5">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="btn-lift h-8 flex-1 text-xs"
                    onClick={() => onEdit(activeProduct)}
                  >
                    <Pencil className="mr-1 h-3.5 w-3.5" /> Izmeni
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="btn-lift h-8 flex-1 text-xs"
                    onClick={() => onDelete(activeProduct)}
                  >
                    <Trash2 className="mr-1 h-3.5 w-3.5" /> Obriši
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

    </section>
  )
}
