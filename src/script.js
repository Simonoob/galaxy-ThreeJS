import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import { Points } from 'three'

/**
 * Base
 */
// Debug
const gui = new dat.GUI({width: 360, closed:true})

//texture
const textureLoader = new THREE.TextureLoader()

const particleTexture = textureLoader.load('/textures/particles/5.png')

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

//galaxy
const parameters = {}
parameters.count = 200000
parameters.size = 0.01
parameters.sizeAttenuation = true
parameters.radius = 5
parameters.branches = 5
parameters.curve = 1
parameters.randomness = 0.4
parameters.randomnessPower = 2.2
parameters.innerColor = '#ff6030'
parameters.outerColor = '#1b3984'


let geometry
let material
let galaxyPoints

const generateGalaxy = () =>{
    const startsPositions = new Float32Array(parameters.count * 3)
    const starsColors = new Float32Array(parameters.count * 3)

    const insideColor = new THREE.Color(parameters.innerColor)
    const outsideColor = new THREE.Color(parameters.outerColor)

    for (let i = 0; i < parameters.count; i++) {
        
        const i3 = i*3
        
        const radius = Math.random() * parameters.radius
        const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2
        const curveAngle = radius * parameters.curve

        const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * parameters.randomness * radius
        const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * parameters.randomness * radius/2
        const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * parameters.randomness * radius

        startsPositions[i3    ] = Math.cos(branchAngle + curveAngle) * radius + randomX
        startsPositions[i3 + 1] = randomY
        startsPositions[i3 + 2] = Math.sin(branchAngle + curveAngle) * radius + randomZ
 
        //color
        const mixedColor = insideColor.clone()
        mixedColor.lerp(outsideColor, radius/parameters.radius)

        starsColors[i3+0] = mixedColor.r
        starsColors[i3+1] = mixedColor.g
        starsColors[i3+2] = mixedColor.b
    }

    //remove old galaxy
    if(geometry || material || galaxyPoints) {
        geometry.dispose()
        material.dispose()
        scene.remove(galaxyPoints)
    }


    geometry = new THREE.BufferGeometry({})
    geometry.setAttribute('position', new THREE.BufferAttribute(startsPositions,3))
    geometry.setAttribute('color', new THREE.BufferAttribute(starsColors,3))
    
    material = new THREE.PointsMaterial({
        size:parameters.size,
        sizeAttenuation: parameters.sizeAttenuation,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        transparent:true,
        alphaMap: particleTexture,
    })
    
    galaxyPoints = new THREE.Points(
        geometry,
        material,
    )
    scene.add(galaxyPoints)
}


generateGalaxy()


//add parameters to gui
gui.add(parameters, 'count').name('stars').min(100).max(1000000).step(100).onFinishChange(generateGalaxy)
gui.add(parameters, 'size').name('star size').min(0.001).max(0.1).step(0.001).onFinishChange(generateGalaxy)
gui.add(parameters, 'sizeAttenuation').name('star perspective').onFinishChange(generateGalaxy)
gui.add(parameters, 'radius').name('galaxy radius').min(0.01).max(20).step(0.01).onFinishChange(generateGalaxy)
gui.add(parameters, 'branches').min(2).max(20).step(1).onFinishChange(generateGalaxy)
gui.add(parameters, 'curve').min(-5).max(5).step(0.001).onFinishChange(generateGalaxy)
gui.add(parameters, 'randomness').min(0).max(2).step(0.001).onFinishChange(generateGalaxy)
gui.add(parameters, 'randomnessPower').name('randomness easing').min(1).max(10).step(0.001).onFinishChange(generateGalaxy)
gui.addColor(parameters, 'innerColor').name('inner color').onFinishChange(generateGalaxy)
gui.addColor(parameters, 'outerColor').name('outer color').onFinishChange(generateGalaxy)


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 2
camera.position.y = 2.5
camera.position.z = 2
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // update galaxy
    galaxyPoints.rotation.y = elapsedTime * 0.1
    galaxyPoints.rotation.z = Math.sin(galaxyPoints.rotation.z + (elapsedTime * Math.PI*0.02))
    galaxyPoints.rotation.x =Math.cos(galaxyPoints.rotation.z + (elapsedTime * Math.PI*0.02))



    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()