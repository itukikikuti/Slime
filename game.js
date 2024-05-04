// Create demo application
var app = new p2.WebGLRenderer(function () {

    var world = new p2.World({ gravity: [0, -5] });
    this.setWorld(world);
    world.solver.tolerance = 0.001;

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
        const p = new p2.Body({ mass: 1, position: [Math.cos(r) * 0.3, Math.sin(r) * 0.3] });
        p.addShape(new p2.Particle());
        bodies.push(p);
        world.addBody(p);
    }

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

        let spring = new p2.LinearSpring(
            bodies[i],
            bodies[(i + 1) % div],
            { stiffness: 500, restLength: Math.sqrt((v - v2) ** 2 + (h - h2) ** 2), damping: 1 }
        );
        arounds.push(spring);
        world.addSpring(spring);

        spring = new p2.LinearSpring(
            bodies[i],
            bodies[(i + 2) % div],
            { stiffness: 500, restLength: Math.sqrt((v - v3) ** 2 + (h - h3) ** 2), damping: 1 }
        );
        everyOther.push(spring);
        world.addSpring(spring);

        spring = new p2.LinearSpring(
            bodies[i],
            bodies[(i + div / 2) % div],
            { stiffness: 400, restLength: Math.sqrt((v - v4) ** 2 + (h - h4) ** 2), damping: 1 }
        );
        diagonal.push(spring);
        world.addSpring(spring);
        
        spring = new p2.LinearSpring(
            bodies[i],
            core,
            { stiffness: 400, restLength: Math.sqrt(v ** 2 + h ** 2), damping: 1 }
        );
        radial.push(spring);
        world.addSpring(spring);
    }

    // var bodies = [];
    var N = 10,
        M = 10,
        timeStep = 1 / 60,
        k = 1000,
        d = 10,
        l = 0.35,
        m = 1;

    // var vec2 = p2.vec2;

    // // Create particle bodies
    // for (var i = 0; i < N; i++) {
    //     bodies.push([]);
    //     for (var j = 0; j < M; j++) {
    //         var p = new p2.Body({
    //             mass: m,//j==M-1 ? 0 : m,
    //             position: [(i - N / 2) * l * 1.05, (j - M / 2) * l * 1.05]
    //         });
    //         p.addShape(new p2.Particle());
    //         bodies[i].push(p);
    //         world.addBody(p);
    //     }
    // }

    // // Vertical springs
    // for (var i = 0; i < N; i++) {
    //     for (var j = 0; j < M - 1; j++) {
    //         var bodyA = bodies[i][j];
    //         var bodyB = bodies[i][j + 1];
    //         var spring = new p2.LinearSpring(bodyA, bodyB, {
    //             stiffness: k,
    //             restLength: l,
    //             damping: d
    //         });
    //         world.addSpring(spring);
    //     }
    // }

    // // Horizontal springs
    // for (var i = 0; i < N - 1; i++) {
    //     for (var j = 0; j < M; j++) {
    //         var bodyA = bodies[i][j];
    //         var bodyB = bodies[i + 1][j];
    //         var spring = new p2.LinearSpring(bodyA, bodyB, {
    //             stiffness: k,
    //             restLength: l,
    //             damping: d
    //         });
    //         world.addSpring(spring);
    //     }
    // }

    // // Diagonal right/down springs
    // for (var i = 0; i < N - 1; i++) {
    //     for (var j = 0; j < M - 1; j++) {
    //         var a = bodies[i][j];
    //         var b = bodies[i + 1][j + 1];
    //         var spring = new p2.LinearSpring(a, b, {
    //             stiffness: k,
    //             restLength: Math.sqrt(l * l + l * l)
    //         });
    //         world.addSpring(spring);
    //     }
    // }
    // // Diagonal left/down springs
    // for (var i = 0; i < N - 1; i++) {
    //     for (var j = 0; j < M - 1; j++) {
    //         var a = bodies[i + 1][j];
    //         var b = bodies[i][j + 1];
    //         var spring = new p2.LinearSpring(a, b, {
    //             stiffness: k,
    //             restLength: Math.sqrt(l * l + l * l)
    //         });
    //         world.addSpring(spring);
    //     }
    // }

    // Create ground
    var planeShape = new p2.Plane();
    var plane = new p2.Body({
        position: [0, (-M / 2) * l * 1.05 - 0.1]
    });
    plane.addShape(planeShape);
    world.addBody(plane);

    // Create circle
    var radius = 1;
    var circleShape = new p2.Circle({ radius: radius });
    var circle = new p2.Body({
        mass: 1,
        position: [0, (M / 2) * l * 1.05 + radius],
        angularVelocity: 1,
    });
    circle.addShape(circleShape);
    world.addBody(circle);


    // Create connected boxes
    var box1 = new p2.Body({
        mass: 1,
        position: [-3, (M / 2) * l * 1.05 + radius],
    });
    var box2 = new p2.Body({
        mass: 1,
        position: [-4, (M / 2) * l * 1.05 + radius],
        angularVelocity: -2
    });
    box1.addShape(new p2.Box({ width: radius, height: radius }));
    box2.addShape(new p2.Box({ width: radius, height: radius }));
    world.addBody(box1);
    world.addBody(box2);
    var s = new p2.LinearSpring(box1, box2, {
        restLength: 1,
        stiffness: 10,
        localAnchorA: [0, 0.5],
        localAnchorB: [0, 0.5],
    });
    world.addSpring(s);


    // Create capsule
    var capsuleShape = new p2.Capsule({ length: 1, radius: 0.25 });
    var capsuleBody = new p2.Body({
        mass: 1,
        position: [4, 1]
    });
    capsuleBody.addShape(capsuleShape);
    world.addBody(capsuleBody);
    var s = new p2.LinearSpring(capsuleBody, plane, {
        restLength: 1,
        stiffness: 10,
        localAnchorA: [-capsuleShape.length / 2, 0],
        worldAnchorB: [4 - capsuleShape.length / 2, 2],
    });
    world.addSpring(s);


    // Create capsules connected with angular spring
    var capsuleShapeA = new p2.Capsule({ length: 1, radius: 0.2 });
    var capsuleShapeB = new p2.Capsule({ length: 1, radius: 0.2 });
    var capsuleBodyA = new p2.Body({
        mass: 1,
        position: [5, 0]
    });
    var capsuleBodyB = new p2.Body({
        mass: 1,
        position: [6, 0]
    });
    capsuleBodyA.addShape(capsuleShapeA);
    capsuleBodyB.addShape(capsuleShapeB);
    world.addBody(capsuleBodyA);
    world.addBody(capsuleBodyB);
    rotationalSpring = new p2.RotationalSpring(capsuleBodyA, capsuleBodyB, {
        stiffness: 10,
        damping: 0.01
    });
    world.addSpring(rotationalSpring);
    var revolute = new p2.RevoluteConstraint(capsuleBodyA, capsuleBodyB, {
        localPivotA: [0.5, 0],
        localPivotB: [-0.5, 0],
        collideConnected: false
    });
    world.addConstraint(revolute);

    this.frame(3, 0, 8, 8);
});
