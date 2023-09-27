import { useRef, useEffect, useState } from 'react';
import { PropTypes } from 'prop-types';
import { createNoise2D, createNoise3D } from 'simplex-noise';

import { extend, useFrame } from '@react-three/fiber';
import {
  MeshReflectorMaterial,
  useTexture,
  useHelper,
  Environment,
  shaderMaterial,
} from '@react-three/drei';

import { DirectionalLightHelper, RepeatWrapping, BackSide, Color } from 'three';

import { FantasyRock } from '../models/Fantasy_rock';
import { Pillar } from '../models/Pillar_with_ancient_runes';
import distantGalaxyVert from '../shaders/distantGalaxyMaterial.vert';
import distantGalaxyFrag from '../shaders/distantGalaxyMaterial.frag';

const planeLength = 300;

//initialise simplex noise instance
const noise2D = createNoise2D();
const noise3D = createNoise3D();

export default function SceneSpaceMagic(props) {
  return (
    <>
      <MyEnv />
      {/* <MyBox position={[-20, 1, -20]} scale={0.3} /> */}
      <MyFloatingRock
        position={[0, 1, -40]}
        scale={0.25}
        zRotation={0}
        {...props}
      />
      <MovingObjects
        id={1}
        position={[0, -5, -150 - planeLength]}
        analyser={props.analyser}
      />
      <MovingObjects
        id={0}
        position={[0, -5, -150]}
        analyser={props.analyser}
      />
      <DistantGalaxy />
      <ambientLight color={'white'} intensity={0.7} />
    </>
  );
}

function MovingObjects({ id, ...props }) {
  const groupRef = useRef();
  const groundRef = useRef();

  useFrame((state) => {
    let time = state.clock.getElapsedTime();

    groundRef.current.position.z = groupRef.current.position.z =
      ((10 * time) % (0.4 * planeLength)) - id * planeLength - 150;
  });

  return (
    <>
      <mesh
        ref={groundRef}
        rotation={[(Math.PI * 3) / 2, 0, 0]}
        receiveShadow={false}
        position={props.position}
      >
        <planeGeometry args={[60, planeLength, 500, 500]} />
        <AlienPanelsMaterial />
      </mesh>
      <group ref={groupRef} position={props.position}>
        {[...Array(12).keys()].map((i) => {
          return (
            <Pillar
              key={i}
              keyy={i}
              scale={30}
              position={[-25, -20, -30 * i + 150]}
              zRotation={Math.PI / 2}
              analyser={props.analyser}
            />
          );
        })}
        {[...Array(12).keys()].map((i) => {
          return (
            <Pillar
              key={i + 5}
              keyy={i + 5}
              scale={[-30, 30, 30]}
              position={[25, -20, -30 * i + 150]}
              zRotation={Math.PI / 2}
              analyser={props.analyser}
            />
          );
        })}
      </group>
    </>
  );
}

function MyEnv() {
  const texture = useTexture(
    '/textures/jeremy-perkins-uhjiu8FjnsQ-unsplash-cloned.jpg'
  );

  texture.repeat.set(6, 5);
  texture.wrapS = texture.wrapT = RepeatWrapping;

  return (
    <Environment background near={10} far={1000} resolution={2048}>
      <mesh rotation={[Math.PI / 15, Math.PI / 2, 0]} scale={100}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshBasicMaterial map={texture} side={BackSide} />
      </mesh>
    </Environment>
  );

  // return (
  //   <mesh
  //     rotation={[Math.PI / 15, Math.PI / 2, 0]}
  //     scale={400}
  //     position={[0, 0, -250]}
  //   >
  //     <sphereGeometry args={[1, 64, 64]} />
  //     <meshBasicMaterial map={texture} side={BackSide} />
  //   </mesh>
  // );
}

function AlienPanelsMaterial() {
  const txtProps = useTexture({
    metalnessMap: '/textures/alien-panels-bl/alien-panels_metallic.png',
    map: '/textures/alien-panels-bl/alien-panels_albedo.png',
    aoMap: '/textures/alien-panels-bl/alien-panels_ao.png',
    // displacementMap: "/textures/alien-panels-bl/alien-panels_height.png",
    normalMap: '/textures/alien-panels-bl/alien-panels_normal-ogl.png',
    roughnessMap: '/textures/alien-panels-bl/alien-panels_roughness.png',
    // displacementMap: "/textures/dirt.jpg",
  });
  Object.values(txtProps).forEach((element) => {
    element.repeat.set(10, 20);
    element.wrapS = element.wrapT = RepeatWrapping;
  });

  return (
    <MeshReflectorMaterial
      resolution={2048}
      blur={[1000, 1000]}
      mixBlur={0.2}
      mixStrength={10}
      mirror={0.3}
      roughness={25}
      metalness={20}
      normalScale={[0, 1]}
      depthScale={0.1}
      depthToBlurRatioBias={0.1}
      minDepthThreshold={0.9}
      maxDepthThreshold={1}
      color={'#781431'}
      {...txtProps}
    />
  );
}

// function MyBox(props) {
//   const box = useRef();
//   const light = useRef();

//   // useHelper(light, DirectionalLightHelper);

//   // const { normalScale } = useControls({ normalScale: -80 });

//   useFrame((state) => {
//     box.current.rotation.x -= 0.01 * state.pointer.y;
//     box.current.rotation.y += 0.01 * state.pointer.x;
//   });

//   const mtCp = useTexture("/textures/161B1F_C7E0EC_90A5B3_7B8C9B-512px.png");

//   const txtProps = useTexture({
//     map: "/textures/space-cruiser-panels2-bl/space-cruiser-panels2_albedo.png",
//     bumpMap:
//       "/textures/space-cruiser-panels2-bl/space-cruiser-panels2_height.png",
//     normalMap:
//       "/textures/space-cruiser-panels2-bl/space-cruiser-panels2_normal-ogl.png",
//   });

//   return (
//     <>
//       <mesh ref={box} {...props}>
//         <boxGeometry args={[10, 10, 10, 10, 10, 10]} />
//         <meshMatcapMaterial matcap={mtCp} {...txtProps} />
//       </mesh>
//       <directionalLight
//         ref={light}
//         intensity={0.05}
//         color="yellow"
//         position={[0, 30, -80]}
//         target-position={[0, 0, 3]}
//         castShadow={false}
//       />
//     </>
//   );
// }

function MyFloatingRock(props) {
  // const light = useRef();

  // useHelper(light, PointLightHelper, 2);

  // useFrame((state) => {
  //   let time = state.clock.getElapsedTime();

  //   light.current.intensity = 30 * (1 + Math.sin(time));
  // });

  return (
    <>
      <FantasyRock {...props} />
      {/* <pointLight
        ref={light}
        color={"#3e86ab"}
        position={[0, 3, -30]}
        distance={8}
      /> */}
    </>
  );
}

const DistantGalaxyMaterial = shaderMaterial(
  {
    uTime: 0,
    uColorStart: new Color('hotpink'),
    uColorEnd: new Color('black'),
  },
  distantGalaxyVert,
  distantGalaxyFrag
);

extend({ DistantGalaxyMaterial });

function DistantGalaxy() {
  const ref = useRef();

  useFrame((state, delta) => (ref.current.uTime += delta));

  return (
    <mesh scale={13} position={[0, 1500, -4500]}>
      <planeGeometry args={[100, 100, 500, 500]} />
      <distantGalaxyMaterial
        key={DistantGalaxy.key}
        ref={ref}
        toneMapped={false}
        transparent={true}
      />
    </mesh>
  );
}

SceneSpaceMagic.propTypes = {
  analyser: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any }),
  ]),
};
MovingObjects.propTypes = {
  id: PropTypes.number,
  position: PropTypes.arrayOf(PropTypes.number),
  analyser: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any }),
  ]),
};
