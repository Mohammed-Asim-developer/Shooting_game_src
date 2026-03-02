/* =========================
   1️⃣ IMPORTS
========================= */
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.182.0/build/three.module.js";

/* =========================
   2️⃣ DOM SETUP
========================= */
const view = document.createElement("canvas");
const btn = document.createElement("button");
const toggle = document.createElement("button");
const spanHits = document.createElement("span");
const spanFails = document.createElement("span");

function setupDOM() {
    view.width = window.innerWidth;
    view.height = window.innerHeight;
    view.style.display = "block";
    view.style.touchAction = "none";

    document.body.style.margin = 0;

    btn.innerText = "shoot";
    toggle.innerText = "Single";

    spanHits.innerText = "Hits : 0";
    spanFails.innerText = "Fails : 0";

    btn.style.cssText =
        "width:50px;height:50px;border-radius:100%;position:fixed;bottom:10px;left:10px";

    toggle.style.cssText =
        "width:50px;height:50px;border-radius:100%;position:fixed;bottom:80px;left:10px";

    spanHits.style.cssText =
        "position:fixed;top:10px;left:20px;white-space:nowrap";

    spanFails.style.cssText =
        "position:fixed;top:10px;right:20px;white-space:nowrap";

    document.body.append(view, btn, toggle, spanHits, spanFails);
}
setupDOM();

/* =========================
   3️⃣ THREE CORE
========================= */
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75,
    view.width / view.height,
    0.1,
    1000
);

const renderer = new THREE.WebGLRenderer({ canvas: view, antialias: true });
renderer.setSize(view.width, view.height);

const textureLoader = new THREE.TextureLoader();
const audioLoader = new THREE.AudioLoader();

/* =========================
   4️⃣ OBJECT CREATION
========================= */

// أرضية
const groundTexture = textureLoader.load("https://raw.githubusercontent.com/Mohammed-Asim-developer/Shooting_game_src/refs/heads/main/map.gif");
const groundMaterial = new THREE.MeshBasicMaterial({
    map: groundTexture,
    side: THREE.DoubleSide
});

const ground1 = new THREE.Mesh(
    new THREE.PlaneGeometry(view.width, view.height),
    groundMaterial
);

const ground2 = ground1.clone();
const ground3 = new THREE.Mesh(
    new THREE.PlaneGeometry(view.height, view.height),
    groundMaterial
);
const ground4 = ground3.clone();
const ground5 = ground1.clone();
const ground6 = ground1.clone();

const walls = new THREE.Group();
walls.add(ground1, ground2, ground3, ground4, ground5, ground6);

// الهدف
const target = new THREE.Mesh(
    new THREE.CircleGeometry(50, 64),
    new THREE.MeshBasicMaterial({
        map: textureLoader.load(
            "https://raw.githubusercontent.com/Mohammed-Asim-developer/Shooting_game_src/refs/heads/main/colorful-archery-target-r8cy205o48r3zoue.png.webp"
        ),
        side: THREE.DoubleSide
    })
);

// مؤشر التصويب
const aim = new THREE.LineSegments(
    new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 20, 0),
        new THREE.Vector3(0, 10, 0),
        new THREE.Vector3(20, 0, 0),
        new THREE.Vector3(10, 0, 0),
        new THREE.Vector3(0, -20, 0),
        new THREE.Vector3(0, -10, 0),
        new THREE.Vector3(-20, 0, 0),
        new THREE.Vector3(-10, 0, 0)
    ]),
    new THREE.LineBasicMaterial({ color: 0x000000 })
);

// فتحة الرصاصة (template)
const holeTemplate = new THREE.Mesh(
    new THREE.CircleGeometry(10, 64),
    new THREE.MeshBasicMaterial({
        map: textureLoader.load(
            "https://raw.githubusercontent.com/Mohammed-Asim-developer/Shooting_game_src/refs/heads/main/BulletHole.png"
        )
    })
);

// السلاح
const weaponHolder = new THREE.Mesh(
    new THREE.PlaneGeometry(4, 2.5),
    new THREE.MeshBasicMaterial({
        map: textureLoader.load(
            "https://raw.githubusercontent.com/Mohammed-Asim-developer/Shooting_game_src/refs/heads/main/hand-with-gun-png.png"
        ),
        transparent: true
    })
);

// الصوت
const listener = new THREE.AudioListener();
const sound = new THREE.Audio(listener);
camera.add(listener);

let isLoaded = false;
audioLoader.load("YOUR_SOUND_URL", buffer => {
    sound.setBuffer(buffer);
    sound.setVolume(1);
    sound.setLoop(false);
    isLoaded = true;
});

/* =========================
   5️⃣ INITIAL POSITIONS
========================= */

function setupScene() {
    camera.lookAt(0, 0, 0);

    ground1.rotation.x = Math.PI / 2;
    ground1.position.y = -(ground1.geometry.parameters.height / 2);

    ground2.position.y = -ground1.position.y;
    ground2.rotation.x = Math.PI / 2;

    ground3.position.x = -(ground1.geometry.parameters.width / 2);
    ground3.rotation.y = -Math.PI / 2;

    ground4.position.x = ground1.geometry.parameters.width / 2;
    ground4.rotation.y = Math.PI / 2;

    ground5.position.z = -(ground1.geometry.parameters.height / 2);
    ground6.position.z = ground1.geometry.parameters.height / 2;

    target.position.set(0, 0, -(ground1.geometry.parameters.height / 2 - 1));

    aim.position.z = -(ground1.geometry.parameters.height / 2 - 1.5);

    camera.position.set(0, 0, ground1.geometry.parameters.height - 397.49);

    weaponHolder.position.set(1.5, -2, -3);

    scene.add(camera, walls, target, aim);
    camera.add(weaponHolder);
}
setupScene();

/* =========================
   6️⃣ GAME VARIABLES
========================= */

const radius = target.geometry.parameters.radius;
const roomLimitWidth = ground1.geometry.parameters.width / 2;
const roomLimitHeight = ground1.geometry.parameters.height / 2;

let direction = new THREE.Vector2(2, 2).normalize();
let speed = 2;
let touchStart = null;
let interval = null;

/* =========================
   7️⃣ GAME LOGIC
========================= */

function updateCounter(element) {
    let current = parseInt(element.innerText.split(":")[1]) || 0;
    element.innerText = `${element.innerText.split(":")[0]}: ${++current}`;
}

function createBulletHole() {
    const bh = holeTemplate.clone();
    bh.position.copy(aim.position);
    scene.add(bh);
    setTimeout(() => scene.remove(bh), 2500);
}

function shoot() {
    const distance = aim.position.distanceTo(target.position);

    if (distance <= radius) {
        scene.remove(target);
        speed++;
        setTimeout(() => scene.add(target), 2000);
        updateCounter(spanHits);
    } else {
        updateCounter(spanFails);
    }

    createBulletHole();

    if (isLoaded) {
        if (sound.isPlaying) sound.stop();
        sound.play();
    }
}

function moveTarget() {
    target.position.x += direction.x * speed;
    target.position.y += direction.y * speed;

    if (
        target.position.x + radius >= roomLimitWidth ||
        target.position.x - radius <= -roomLimitWidth
    )
        direction.x *= -1;

    if (
        target.position.y + radius >= roomLimitHeight ||
        target.position.y - radius <= -roomLimitHeight
    )
        direction.y *= -1;
}

function limitAim() {
    if (aim.position.x > roomLimitWidth) aim.position.x = roomLimitWidth;
    if (aim.position.x < -roomLimitWidth) aim.position.x = -roomLimitWidth;

    if (aim.position.y > roomLimitHeight) aim.position.y = roomLimitHeight;
    if (aim.position.y < -roomLimitHeight) aim.position.y = -roomLimitHeight;
}

/* =========================
   8️⃣ EVENTS
========================= */

view.addEventListener("touchstart", e => {
    const t = e.touches[0];
    touchStart = { x: t.clientX, y: t.clientY };
});

view.addEventListener("touchmove", e => {
    if (!touchStart) return;

    const t = e.touches[0];
    const dx = t.clientX - touchStart.x;
    const dy = t.clientY - touchStart.y;

    aim.position.x += dx * 1.5;
    aim.position.y -= dy * 1.5;

    touchStart = { x: t.clientX, y: t.clientY };
});

view.addEventListener("touchend", () => (touchStart = null));

btn.addEventListener("touchstart", () => {
    if (toggle.innerText === "Single") shoot();
    else if (!interval) interval = setInterval(shoot, 100);
});

btn.addEventListener("touchend", () => {
    clearInterval(interval);
    interval = null;
});

toggle.addEventListener("touchstart", () => {
    toggle.innerText = toggle.innerText === "Single" ? "Auto" : "Single";
});

/* =========================
   9️⃣ LOOP
========================= */

function animate() {
    requestAnimationFrame(animate);
    moveTarget();
    limitAim();
    renderer.render(scene, camera);
}
animate();
