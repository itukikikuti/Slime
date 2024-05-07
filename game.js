import * as THREE from "three";

const width = 1280, height = 720;
const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
renderer.setPixelRatio(window.devicePixelRatio);

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const clock = new THREE.Clock();

const camera = new THREE.OrthographicCamera(-10, 10, 5.625, -5.625, 0, 1000);
camera.position.set(0, 0, 10);
scene.add(camera);

const world = new p2.World();

const core = new p2.Body({ mass: 1, position: [0, 0] });
core.addShape(new p2.Particle());
world.addBody(core);

const bodies = [];
const arounds = [];
const everyOther = [];
const diagonal = [];
const radial = [];
const div = 16;

for (let i = 0; i < div; i++) {
    const r = (Math.PI * 2) / div * i;
    const p = new p2.Body({ mass: 10.0 / div, position: [Math.cos(r) * 0.3, Math.sin(r) * 0.3] });
    p.addShape(new p2.Particle());
    bodies.push(p);
    world.addBody(p);
}

const shapeMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    depthTest: false
});
let shapeMesh = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape()), shapeMaterial);
scene.add(shapeMesh);

for (let i = 0; i < div; i++) {
    let r = (Math.PI * 2) / div * i;
    const v = Math.cos(r) * 0.3;
    const h = Math.sin(r) * 0.3;

    r = (Math.PI * 2) / div * ((i + 1) % div);
    const v2 = Math.cos(r) * 0.3;
    const h2 = Math.sin(r) * 0.3;

    r = (Math.PI * 2) / div * ((i + 2) % div);
    const v3 = Math.cos(r) * 0.3;
    const h3 = Math.sin(r) * 0.3;

    r = (Math.PI * 2) / div * ((i + div / 2) % div);
    const v4 = Math.cos(r) * 0.3;
    const h4 = Math.sin(r) * 0.3;

    const damping = 4;

    let spring = new p2.LinearSpring(
        bodies[i],
        bodies[(i + 1) % div],
        { stiffness: 5000.0 / div, restLength: Math.sqrt((v - v2) ** 2 + (h - h2) ** 2), damping: damping }
    );
    arounds.push(spring);
    world.addSpring(spring);

    spring = new p2.LinearSpring(
        bodies[i],
        bodies[(i + 2) % div],
        { stiffness: 5000.0 / div, restLength: Math.sqrt((v - v3) ** 2 + (h - h3) ** 2), damping: damping }
    );
    everyOther.push(spring);
    world.addSpring(spring);

    spring = new p2.LinearSpring(
        bodies[i],
        bodies[(i + div / 2) % div],
        { stiffness: 4000.0 / div, restLength: Math.sqrt((v - v4) ** 2 + (h - h4) ** 2), damping: damping }
    );
    diagonal.push(spring);
    world.addSpring(spring);

    spring = new p2.LinearSpring(
        bodies[i],
        core,
        { stiffness: 4000.0 / div, restLength: Math.sqrt(v ** 2 + h ** 2), damping: damping }
    );
    radial.push(spring);
    world.addSpring(spring);
}

let pressed = false;
let mousePos;
let mouseOrigin;

window.addEventListener("mousemove", e => {
    mousePos = { x: e.clientX, y: e.clientY };
});

window.addEventListener("mousedown", e => {
    if (e.button === 0) {
        pressed = true;
        mouseOrigin = mousePos;
    }
});

window.addEventListener("mouseup", e => {
    if (e.button === 0) {
        pressed = false;
    }
});

world.on("postStep", e => {

    let length = 0.0;

    if (pressed) {
        length = Math.sqrt((mouseOrigin.x - mousePos.x) ** 2 + (mouseOrigin.y - mousePos.y) ** 2) * 0.002;
    }

    for (let i = 0; i < div; i++) {
        let r = (Math.PI * 2) / div * i;
        const v = Math.cos(r) * (0.3 + length);
        const h = Math.sin(r) * 0.3;

        r = (Math.PI * 2) / div * ((i + 1) % div);
        const v2 = Math.cos(r) * (0.3 + length);
        const h2 = Math.sin(r) * 0.3;

        r = (Math.PI * 2) / div * ((i + 2) % div);
        const v3 = Math.cos(r) * (0.3 + length);
        const h3 = Math.sin(r) * 0.3;

        r = (Math.PI * 2) / div * ((i + div / 2) % div);
        const v4 = Math.cos(r) * (0.3 + length);
        const h4 = Math.sin(r) * 0.3;

        arounds[i].restLength = Math.sqrt((v - v2) ** 2 + (h - h2) ** 2);
        everyOther[i].restLength = Math.sqrt((v - v3) ** 2 + (h - h3) ** 2);
        diagonal[i].restLength = Math.sqrt((v - v4) ** 2 + (h - h4) ** 2);
        radial[i].restLength = Math.sqrt(v ** 2 + h ** 2);
    }
});

const box = new p2.Body({
    mass: 1,
    position: [0, 5],
    angularVelocity: 1
});
box.addShape(new p2.Box({ width: 2, height: 2 }));
world.addBody(box);

const boxGeometry = new THREE.PlaneGeometry(2, 2);
const boxMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    transparent: true,
    depthTest: false
});
const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
scene.add(boxMesh);

const radius = 1;

const plane = new p2.Body({
    position: [0, -1]
});
plane.addShape(new p2.Plane());
world.addBody(plane);

const box1 = new p2.Body({
    mass: 1,
    position: [-4, 2 + radius],
});
const box2 = new p2.Body({
    mass: 1,
    position: [-6, 2 + radius],
    angularVelocity: -2
});
box1.addShape(new p2.Box({ width: radius, height: radius }));
box2.addShape(new p2.Box({ width: radius, height: radius }));
world.addBody(box1);
world.addBody(box2);

const box1Geometry = new THREE.PlaneGeometry(radius, radius);
const box1Material = new THREE.MeshBasicMaterial({
    color: 0x0000ff,
    transparent: true,
    depthTest: false
});
const box1Mesh = new THREE.Mesh(box1Geometry, box1Material);
const box2Mesh = new THREE.Mesh(box1Geometry, box1Material);
scene.add(box1Mesh, box2Mesh);

const spring = new p2.LinearSpring(box1, box2, {
    restLength: 1,
    stiffness: 10,
    localAnchorA: [0, 0.5],
    localAnchorB: [0, 0.5],
});
world.addSpring(spring);

while (true) {
    world.step(clock.getDelta());

    const shape = new THREE.Shape();
    shape.moveTo(bodies[0].position[0], bodies[0].position[1]);

    for (let i = 1; i < div; i++) {
        const p1 = new THREE.Vector2(bodies[i - 1].position[0], bodies[i - 1].position[1]);
        const p2 = new THREE.Vector2(bodies[i].position[0], bodies[i].position[1]);
        const l = p1.distanceTo(p2) / 4;
        const np1 = new THREE.Vector2(bodies[(i + div - 2) % div].position[0], bodies[(i + div - 2) % div].position[1]);
        const np2 = new THREE.Vector2(bodies[(i + 1) % div].position[0], bodies[(i + 1) % div].position[1]);
        const cp1 = p1.clone().add(p1.clone().sub(np1).normalize().multiplyScalar(l));
        const cp2 = p2.clone().add(p2.clone().sub(np2).normalize().multiplyScalar(l));
        shape.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, p2.x, p2.y);
    }

    shapeMesh.geometry.dispose();
    shapeMesh.geometry = new THREE.ShapeGeometry(shape);

    boxMesh.position.set(box.position[0], box.position[1], 0);
    boxMesh.rotation.z = box.angle;

    box1Mesh.position.set(box1.position[0], box1.position[1], 0);
    box1Mesh.rotation.z = box1.angle;

    box2Mesh.position.set(box2.position[0], box2.position[1], 0);
    box2Mesh.rotation.z = box2.angle;

    renderer.render(scene, camera);

    await new Promise(resolve => requestAnimationFrame(resolve));
}
