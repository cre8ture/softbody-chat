let softBody;
let inputBox;
let softBody1, softBody2, inputBox1, inputBox2;

function setup() {
    createCanvas(windowWidth, windowHeight);
    inputBox1 = select('#inputBox1');
    inputBox2 = select('#inputBox2');
    softBody1 = new SoftBody(width / 4, height / 2, 100, 20);
    softBody2 = new ToxiSoftBody(3 * width / 4, height / 2, 100, 20);
}

function draw() {
    background(39, 40, 34);
    softBody1.update();
    softBody1.display();
    softBody2.update();
    softBody2.display();

    let avgPos1 = createVector(0, 0);
    for (let v of softBody1.vertices) {
        avgPos1.add(v.pos);
    }
    avgPos1.div(softBody1.vertices.length);
    inputBox1.position(avgPos1.x, avgPos1.y);

    let avgPos2 = createVector(0, 0);
    for (let p of softBody2.particles) {
        avgPos2.add(p.x, p.y);
    }
    avgPos2.div(softBody2.particles.length);
    inputBox2.position(avgPos2.x, avgPos2.y);
}

function mouseDragged() {
    softBody1.drag(mouseX, mouseY);
    softBody2.drag(mouseX, mouseY);
}

function mouseReleased() {
    softBody1.release();
    softBody2.release();
}

class ToxiSoftBody {
    constructor(x, y, size, verticesCount) {
        this.physics = new toxi.physics2d.VerletPhysics2D();
        this.particles = [];
        this.springs = [];

        for (let i = 0; i < verticesCount; i++) {
            let angle = map(i, 0, verticesCount, 0, TWO_PI);
            let s = toxi.geom.Vec2D.fromTheta(angle).scaleSelf(size);
            let particle = new toxi.physics2d.VerletParticle2D(s);
            this.particles.push(particle);
            this.physics.addParticle(particle);

            if (i > 0) {
                let spring = new toxi.physics2d.VerletSpring2D(this.particles[i], this.particles[i - 1], size, 0.01);
                this.springs.push(spring);
                this.physics.addSpring(spring);
            }
        }

        let spring = new toxi.physics2d.VerletSpring2D(this.particles[0], this.particles[verticesCount - 1], size, 0.01);
        this.springs.push(spring);
        this.physics.addSpring(spring);
    }

    update() {
        this.physics.update();

         // Add border check
         for (let particle of this.particles) {
            if (particle.x > width) particle.x = width;
            if (particle.x < 0) particle.x = 0;
            if (particle.y > height) particle.y = height;
            if (particle.y < 0) particle.y = 0;
        }
    }

    display() {
        stroke(255);
        fill(127);
        beginShape();
        for (let particle of this.particles) {
            vertex(particle.x, particle.y);
        }
        endShape(CLOSE);
    }

    drag(mx, my) {
        let mousePos = new toxi.geom.Vec2D(mx, my);
        if (mousePos.distanceTo(this.particles[0]) < 100) {
            this.particles[0].set(mousePos);
        }
    }

    release() {
        // No need to do anything here for the toxiclibs soft body
    }
}

class SoftBody {
    constructor(x, y, size, verticesCount) {
        this.basePos = createVector(x, y);
        this.vertices = [];
        this.dragging = false;

        for (let i = 0; i < verticesCount; i++) {
            let angle = map(i, 0, verticesCount, 0, TWO_PI);
            let s = p5.Vector.fromAngle(angle).mult(size);
            // Adjust y-coordinate based on angle to form egg shape
            s.y *= map(sin(angle), -1, 1, 0.6, 1);
            this.vertices[i] = new Vertex(s.x, s.y);
        }
    }

    update() {
        for (let v of this.vertices) {
            v.behaviors(this.basePos, this.vertices);
            v.update();
        }
    }


    display() {
        stroke(255);
        fill(127);
        beginShape();
        for (let v of this.vertices) {
            vertex(v.pos.x, v.pos.y);
        }
        endShape(CLOSE);
    }

    drag(mx, my) {
        let mousePos = createVector(mx, my);
        if (mousePos.dist(this.basePos) < 100) {
            this.basePos.set(mousePos);
            this.dragging = true;
        }
    }

    release() {
        this.dragging = false;
    }
}

class Vertex {
    constructor(x, y) {
        this.pos = createVector(x, y);
        this.vel = createVector();
        this.acc = createVector();
        this.maxSpeed = 5;
    }

    behaviors(basePos, vertices) {
        let arrive = this.arrive(basePos);
        let separate = this.separate(vertices);
        this.applyForce(arrive);
        this.applyForce(separate);
    }

    separate(vertices) {
        let desiredSeparation = 50;
        let steer = createVector();
        let count = 0;
        for (let other of vertices) {
            let d = p5.Vector.dist(this.pos, other.pos);
            if ((d > 0) && (d < desiredSeparation)) {
                let diff = p5.Vector.sub(this.pos, other.pos);
                diff.normalize();
                diff.div(d);
                steer.add(diff);
                count++;
            }
        }
        if (count > 0) {
            steer.div(count);
        }
        if (steer.mag() > 0) {
            steer.normalize();
            steer.mult(this.maxSpeed);
            steer.sub(this.vel);
            steer.limit(this.maxSpeed);
        }
        return steer;
    }

    applyForce(f) {
        this.acc.add(f);
    }

    arrive(target) {
        let desired = p5.Vector.sub(target, this.pos);
        let d = desired.mag();
        let speed = this.maxSpeed;
        if (d < 100) {
            speed = map(d, 0, 100, 0, this.maxSpeed);
        }
        desired.setMag(speed);
        // Adjust y-coordinate based on angle to maintain egg shape
        desired.y *= map(sin(this.pos.heading()), -1, 1, 0.6, 1);
        let steer = p5.Vector.sub(desired, this.vel);
        steer.limit(this.maxSpeed);
        return steer;
    }


    update() {
        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.acc.mult(0);

         // Add border check
         if (this.pos.x > width) this.pos.x = width;
         if (this.pos.x < 0) this.pos.x = 0;
         if (this.pos.y > height) this.pos.y = height;
         if (this.pos.y < 0) this.pos.y = 0;
    }
}