var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
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

const body = Bodies.circle(300, 300, 5, { collisionFilter: { category: 0x0002, mask: 0x0001 } })
const bodies = [];
const constraints = [];
const div = 10;

for (let i = 0; i < div; i++) {
    const r = (Math.PI * 2) / div * i;
    bodies.push(Bodies.circle(300 + Math.cos(r) * 50, 300 + Math.sin(r) * 50, 5, { collisionFilter: { category: 0x0002, mask: 0x0001 } }));
}

for (let i = 0; i < div; i++) {
    constraints.push(Constraint.create({
        bodyA: bodies[i],
        pointA: { x: 0, y: 0 },
        bodyB: bodies[(i + 1) % div],
        pointB: { x: 0, y: 0 },
        stiffness: 0.05
    }));

    constraints.push(Constraint.create({
        bodyA: bodies[i],
        pointA: { x: 0, y: 0 },
        bodyB: bodies[(i + 2) % div],
        pointB: { x: 0, y: 0 },
        stiffness: 0.05
    }));
    
    constraints.push(Constraint.create({
        bodyA: bodies[i],
        pointA: { x: 0, y: 0 },
        bodyB: bodies[(i + div / 2) % div],
        pointB: { x: 0, y: 0 },
        stiffness: 0.003
    }));
    
    constraints.push(Constraint.create({
        bodyA: bodies[i],
        pointA: { x: 0, y: 0 },
        bodyB: body,
        pointB: { x: 0, y: 0 },
        stiffness: 0.01
    }));
}

Composite.add(world, [body, ...bodies, ...constraints]);

Composite.add(world, [
    Bodies.rectangle(320, 0, 640, 50, { isStatic: true }),
    Bodies.rectangle(320, 480, 640, 50, { isStatic: true }),
    Bodies.rectangle(640, 240, 50, 480, { isStatic: true }),
    Bodies.rectangle(0, 240, 50, 480, { isStatic: true })
]);

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
