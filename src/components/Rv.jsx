
import React from 'react'
import { useGLTF } from '@react-three/drei'

export function RVmodel(props) {
  const { nodes, materials } = useGLTF('models/rv.glb')
  return (
        <group {...props} dispose={null} position={[-11, -5.2, 11]}  rotation={[0.04, 20, 0]} scale={1.5}>
       <group position={[2.776, 1.636, -1.041]} rotation={[-Math.PI / 2, 0, 0.456]} scale={[82.042, 84.582, 82.042]}>
        <mesh geometry={nodes.Cube016_1.geometry} material={materials['Material.018']} />
        <mesh geometry={nodes.Cube016_2.geometry} material={materials['Material.012']} />
        <mesh geometry={nodes.Cube016_3.geometry} material={materials['Material.013']} />
        <mesh geometry={nodes.Cube016_4.geometry} material={materials['Material.021']} />
        <mesh geometry={nodes.Cube016_5.geometry} material={materials['Material.014']} />
        <mesh geometry={nodes.Cube016_6.geometry} material={materials['Material.020']} />
        <mesh geometry={nodes.Cube016_7.geometry} material={materials['Material.015']} />
        <mesh geometry={nodes.Cube016_8.geometry} material={materials['Material.017']} />
    </group>
    </group>

  )
}

useGLTF.preload('models/rv.glb')
