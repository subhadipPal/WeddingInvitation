'use client'
import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const PETAL_COUNT = 60

type PetalState = {
  x: number; y: number; z: number
  vx: number; vy: number
  rotX: number; rotY: number; rotZ: number
  rx: number; ry: number; rz: number
  phase: number
  scale: number
}

function rnd(min: number, max: number) {
  return min + Math.random() * (max - min)
}

/** Heart-shaped petal using a CatmullRom curve, flattened into a flat shape */
function createPetalGeometry() {
  // Petal outline: teardrop / oval shape using a custom BufferGeometry
  const shape = new THREE.Shape()
  shape.moveTo(0, 0.35)
  shape.bezierCurveTo(0.28, 0.35, 0.28, 0, 0.28, -0.1)
  shape.bezierCurveTo(0.28, -0.3, 0.14, -0.45, 0, -0.45)
  shape.bezierCurveTo(-0.14, -0.45, -0.28, -0.3, -0.28, -0.1)
  shape.bezierCurveTo(-0.28, 0, -0.28, 0.35, 0, 0.35)
  return new THREE.ShapeGeometry(shape, 8)
}

function Petals() {
  const meshRef = useRef<THREE.InstancedMesh>(null!)

  const geometry = useMemo(() => createPetalGeometry(), [])

  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(0xf9b8cc),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.75,
        depthWrite: false,
      }),
    [],
  )

  const petals = useMemo<PetalState[]>(() => {
    return Array.from({ length: PETAL_COUNT }, () => ({
      x: rnd(-5, 5),
      y: rnd(2, 12),
      z: rnd(-2, 0.5),
      vx: rnd(-0.006, 0.006),
      vy: rnd(0.006, 0.018),
      rotX: rnd(0, Math.PI * 2),
      rotY: rnd(0, Math.PI * 2),
      rotZ: rnd(0, Math.PI * 2),
      rx: rnd(-0.008, 0.008),
      ry: rnd(-0.012, 0.012),
      rz: rnd(-0.01, 0.01),
      phase: rnd(0, Math.PI * 2),
      scale: rnd(0.8, 1.5),
    }))
  }, [])

  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const mesh = meshRef.current

    for (let i = 0; i < PETAL_COUNT; i++) {
      const p = petals[i]
      p.y -= p.vy
      p.x += p.vx + Math.sin(t * 0.5 + p.phase) * 0.004

      p.rotX += p.rx
      p.rotY += p.ry
      p.rotZ += p.rz

      if (p.y < -8) {
        p.y = rnd(7, 14)
        p.x = rnd(-5, 5)
      }

      dummy.position.set(p.x, p.y, p.z)
      dummy.rotation.set(p.rotX, p.rotY, p.rotZ)
      dummy.scale.setScalar(p.scale)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }

    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[geometry, material, PETAL_COUNT]} />
  )
}

export default function MicPetalOverlay() {
  return (
    <div
      className="fixed inset-0 z-[100] pointer-events-none"
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 7], fov: 70 }}
        gl={{ alpha: true, antialias: false, powerPreference: 'low-power' }}
        style={{ background: 'transparent' }}
      >
        <Petals />
      </Canvas>
    </div>
  )
}
