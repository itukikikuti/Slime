var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Events = Matter.Events,
    Composites = Matter.Composites,
    Common = Matter.Common,
    Constraint = Matter.Constraint,
    MouseConstraint = Matter.MouseConstraint,
    Mouse = Matter.Mouse,
    Composite = Matter.Composite,
    Bodies = Matter.Bodies;

var engine = Engine.create(),
    world = engine.world;

var render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: 640,
        height: 480,
        showAngleIndicator: true
    }
});

Render.run(render);

var runner = Runner.create();
Runner.run(runner, engine);

const core = Bodies.circle(300, 300, 5, { collisionFilter: { category: 0x0002, mask: 0x0001 } })
const bodies = [];
const arounds = [];
const everyOther = [];
const diagonal = [];
const radial = [];
const div = 20;

for (let i = 0; i < div; i++) {
    const r = (Math.PI * 2) / div * i;
    bodies.push(Bodies.circle(300 + Math.cos(r) * 50, 300 + Math.sin(r) * 50, 5, { collisionFilter: { category: 0x0002, mask: 0x0001 } }));
}

for (let i = 0; i < div; i++) {
    arounds.push(Constraint.create({
        bodyA: bodies[i],
        pointA: { x: 0, y: 0 },
        bodyB: bodies[(i + 1) % div],
        pointB: { x: 0, y: 0 },
        stiffness: 0.05
    }));

    everyOther.push(Constraint.create({
        bodyA: bodies[i],
        pointA: { x: 0, y: 0 },
        bodyB: bodies[(i + 2) % div],
        pointB: { x: 0, y: 0 },
        stiffness: 0.05
    }));

    diagonal.push(Constraint.create({
        bodyA: bodies[i],
        pointA: { x: 0, y: 0 },
        bodyB: bodies[(i + div / 2) % div],
        pointB: { x: 0, y: 0 },
        stiffness: 0.003
    }));

    radial.push(Constraint.create({
        bodyA: bodies[i],
        pointA: { x: 0, y: 0 },
        bodyB: core,
        pointB: { x: 0, y: 0 },
        stiffness: 0.01
    }));
}

Composite.add(world, [core, ...bodies, ...arounds, ...everyOther, ...diagonal, ...radial]);

Composite.add(world, [
    Bodies.rectangle(320, 0, 640, 50, { isStatic: true }),
    Bodies.rectangle(320, 480, 640, 50, { isStatic: true }),
    Bodies.rectangle(640, 240, 50, 480, { isStatic: true }),
    Bodies.rectangle(0, 240, 50, 480, { isStatic: true })
]);

let time = 0;

Events.on(engine, 'beforeUpdate', function (event) {

    time += event.delta * 0.01;

    for (let i = 0; i < div; i++) {
        let r = (Math.PI * 2) / div * i;
        const v = Math.cos(r) * (50 + time);
        const h = Math.sin(r) * 50;
        
        r = (Math.PI * 2) / div * ((i + 1) % div);
        const v2 = Math.cos(r) * (50 + time);
        const h2 = Math.sin(r) * 50;
        
        r = (Math.PI * 2) / div * ((i + 2) % div);
        const v3 = Math.cos(r) * (50 + time);
        const h3 = Math.sin(r) * 50;

        r = (Math.PI * 2) / div * ((i + div / 2) % div);
        const v4 = Math.cos(r) * (50 + time);
        const h4 = Math.sin(r) * 50;

        arounds[i].length = Math.sqrt((v - v2) ** 2 + (h - h2) ** 2);
        everyOther[i].length = Math.sqrt((v - v3) ** 2 + (h - h3) ** 2);
        diagonal[i].length = Math.sqrt((v - v4) ** 2 + (h - h4) ** 2);
        radial[i].length = Math.sqrt(v ** 2 + h ** 2);
    }
    // Body.setPosition(compound, { x: 600, y: py }, true);
    // Body.rotate(compound, 1 * Math.PI * timeScale, null, true);
});

var mouse = Mouse.create(render.canvas),
    mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            angularStiffness: 0,
            render: {
                visible: false
            }
        }
    });

Composite.add(world, mouseConstraint);

render.mouse = mouse;

Render.lookAt(render, {
    min: { x: 0, y: 0 },
    max: { x: 640, y: 480 }
});
