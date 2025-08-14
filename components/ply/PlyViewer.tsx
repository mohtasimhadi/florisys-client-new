// components/ply/PlyViewer.tsx
'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function PlyViewer({ src }: { src: string }) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const disposeRef = useRef<() => void>(() => {})

  useEffect(() => {
    if (!hostRef.current) return

    let mounted = true
    const host = hostRef.current
    const width = host.clientWidth
    const height = host.clientHeight

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xffffff)

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 1000)
    camera.position.set(0.8, 0.8, 0.8)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    host.appendChild(renderer.domElement)

    const ambient = new THREE.AmbientLight(0xffffff, 0.8)
    scene.add(ambient)
    const dir = new THREE.DirectionalLight(0xffffff, 0.6)
    dir.position.set(1, 1, 1)
    scene.add(dir)

    // orbit controls (dynamic import)
    let controls: any
    ;(async () => {
      const [{ OrbitControls }, { PLYLoader }] = await Promise.all([
        import('three/examples/jsm/controls/OrbitControls.js'),
        import('three/examples/jsm/loaders/PLYLoader.js'),
      ])

      controls = new OrbitControls(camera, renderer.domElement)

      const loader = new PLYLoader()
      loader.load(
        src,
        (geometry: any) => {
          geometry.computeVertexNormals?.()
          const material = new THREE.MeshStandardMaterial({ color: 0x4f46e5, metalness: 0.1, roughness: 0.9 })
          const mesh = new THREE.Mesh(geometry, material)
          scene.add(mesh)

          // fit camera to geometry
          geometry.computeBoundingBox?.()
          const bb = geometry.boundingBox as THREE.Box3
          if (bb) {
            const size = new THREE.Vector3()
            bb.getSize(size)
            const center = new THREE.Vector3()
            bb.getCenter(center)
            mesh.position.sub(center)
            const maxDim = Math.max(size.x, size.y, size.z)
            const dist = maxDim * 1.8
            camera.position.set(dist, dist, dist)
            camera.lookAt(0, 0, 0)
          }
        },
        undefined,
        () => {
          // load error — keep scene empty
        }
      )
    })()

    const ro = new ResizeObserver(() => {
      const w = host.clientWidth
      const h = host.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    })
    ro.observe(host)

    let raf = 0
    const tick = () => {
      if (!mounted) return
      renderer.render(scene, camera)
      raf = requestAnimationFrame(tick)
    }
    tick()

    disposeRef.current = () => {
      mounted = false
      cancelAnimationFrame(raf)
      ro.disconnect()
      renderer.dispose()
      host.removeChild(renderer.domElement)
      scene.traverse(obj => {
        if ((obj as any).geometry) (obj as any).geometry.dispose?.()
        if ((obj as any).material) {
          const m = (obj as any).material
          if (Array.isArray(m)) m.forEach(mm => mm.dispose?.())
          else m.dispose?.()
        }
      })
    }

    return () => disposeRef.current()
  }, [src])

  return <div ref={hostRef} className="h-72 w-full rounded-lg border border-sky-200 bg-white" />
}
