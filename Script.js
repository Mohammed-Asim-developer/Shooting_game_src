/* =========================
               1️⃣ IMPORTS
            ========================= */
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.182.0/build/three.module.js";
//test
/* =========================
               2️⃣ DOM SETUP
            ========================= */
const view = document.createElement("canvas"),
    btn = document.createElement("button"),
    toggle = document.createElement("button"),
    spanHits = document.createElement("span"),
    spanFails = document.createElement("span");

function setupDOM() {
    view.width = window.innerWidth;
    view.height = window.innerHeight;
    view.style.display = "block";
    view.style.touchAction = "none";

    document.body.style.margin = 0;

    btn.innerHTML =
        '<img src="https://raw.githubusercontent.com/Mohammed-Asim-developer/Shooting_game_src/refs/heads/main/bullet_icon.png" width="24" height="24">';
    toggle.innerText = "Single";

    spanHits.innerText = "Hits : 0";
    spanFails.innerText = "Fails : 0";

    btn.style.cssText =
        "width:3rem;height:3rem;border-radius:100%;position:fixed;bottom:10px;left:10px";

    toggle.style.cssText =
        "width:3rem;height:3rem;border-radius:100%;position:fixed;bottom:80px;left:10px";

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
const scene = new THREE.Scene(),
    camera = new THREE.PerspectiveCamera(
        75,
        view.width / view.height,
        0.1,
        1000
    ),
    renderer = new THREE.WebGLRenderer({
        canvas: view,
        antialias: true
    }),
    textureLoader = new THREE.TextureLoader(),
    audioLoader = new THREE.AudioLoader();

renderer.setSize(view.width, view.height);

/* =========================
               4️⃣ OBJECT CREATION
            ========================= */
console.log(window.innerWidth);
console.log(window.innerHeight);
console.log(view.width);
console.log(view.height);
console.log(checkOrientation);
// أرضية
const groundTexture = textureLoader.load(
        "https://raw.githubusercontent.com/Mohammed-Asim-developer/Shooting_game_src/refs/heads/main/map.gif"
    ),
    groundMaterial = new THREE.MeshBasicMaterial({
        map: groundTexture,
        side: THREE.DoubleSide
    }),
    ground1 = new THREE.Mesh(
        new THREE.PlaneGeometry(view.width, view.height),
        groundMaterial
    ),
    ground2 = ground1.clone(),
    ground3 = new THREE.Mesh(
        new THREE.PlaneGeometry(view.height, view.height),
        groundMaterial
    ),
    ground4 = ground3.clone(),
    ground5 = ground1.clone(),
    ground6 = ground1.clone(),
    walls = new THREE.Group();
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
const listener = new THREE.AudioListener(),
    shootSound = new THREE.Audio(listener),
    reloadSound = new THREE.Audio(listener);
camera.add(listener);

let isLoaded = false;
audioLoader.load(
    "https://raw.githubusercontent.com/Mohammed-Asim-developer/Shooting_game_src/refs/heads/main/ShootingSound.mp3",
    buffer => {
        shootSound.setBuffer(buffer);
        shootSound.setVolume(1);
        shootSound.setLoop(false);
        isLoaded = true;
    }
);
audioLoader.load(
    "https://raw.githubusercontent.com/Mohammed-Asim-developer/Shooting_game_src/refs/heads/main/reload_sound.mp3",
    buffer => {
        reloadSound.setBuffer(buffer);
        reloadSound.setVolume(1);
        reloadSound.setLoop(false);
        isLoaded = true;
    }
);

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

const radius = target.geometry.parameters.radius,
    roomLimitWidth = ground1.geometry.parameters.width / 2,
    roomLimitHeight = ground1.geometry.parameters.height / 2;

let direction = new THREE.Vector2(2, 2).normalize(),
    speed = 2,
    touchStart = null,
    interval = null,
    aimTouchId = null,
    magazine = 30;

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
    bh.position.z = target.position.z - 1;
    scene.add(bh);
    setTimeout(() => {
        scene.remove(bh);
        bh.geometry.dispose();
        bh.material.map.dispose();
        bh.material.dispose();
    }, 2500);
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
    recoil();

    if (isLoaded) {
        if (shootSound.isPlaying) shootSound.stop();
        shootSound.clone().play();
    }
}

function reload() {
    if (isLoaded) {
        if (reloadSound.isPlaying) reloadSound.stop();
        reloadSound.play();
    }
    btn.children[0].style.transition = "transform 4s linear";
    setTimeout(() => {
        btn.children[0].style.transform = "rotate(360deg)";
    }, 10);
    setTimeout(() => {
        magazine = 30;
        btn.disabled = false;
        btn.innerHTML =
            '<img src="https://raw.githubusercontent.com/Mohammed-Asim-developer/Shooting_game_src/refs/heads/main/bullet_icon.png" width="24" height="24">';
    }, 4000);
    weaponHolder.rotation.z = Math.PI / 8;
    setTimeout(() => (weaponHolder.rotation.z = 0), 3500);
}

function recoil() {
    weaponHolder.position.y += 0.2;
    weaponHolder.position.z += 0.5;
    setTimeout(() => {
        weaponHolder.position.y -= 0.2;
        weaponHolder.position.z -= 0.5;
    }, 60);
}

function checkOrientation() {
    if (window.innerWidth > window.innerHeight) {
        view.height = window.innerWidth;
        view.width = window.innerHeight;
        // إعدادات الوضع الأفقي
        camera.aspect = view.height / view.width;
        camera.updateProjectionMatrix();
        renderer.setSize(view.height, view.width);
    } else {
        view.height = window.innerHeight;
        view.width = window.innerWidth;
        // إعدادات الوضع الرأسي
        camera.aspect = view.width / view.height;
        camera.updateProjectionMatrix();
        renderer.setSize(view.width, view.height);
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
    weaponHolder.position.x = 1.5 + aim.position.x * 0.001;
    weaponHolder.position.y = -1.5 + aim.position.y * 0.001;
}

/* =========================
               8️⃣ EVENTS
            ========================= */

window.addEventListener("resize", () => {
    checkOrientation();
});
window.addEventListener("load", () => {
    checkOrientation();
});

view.addEventListener("touchstart", e => {
    const touch = e.changedTouches[0];

    // إذا لا يوجد إصبع مخصص للحركة
    if (aimTouchId === null) {
        aimTouchId = touch.identifier;

        touchStart = {
            x: touch.clientX,
            y: touch.clientY
        };
    }
});

view.addEventListener("touchmove", e => {
    for (let touch of e.changedTouches) {
        if (touch.identifier === aimTouchId) {
            const dx = touch.clientX - touchStart.x;
            const dy = touch.clientY - touchStart.y;

            aim.position.x += dx * 1.5;
            aim.position.y -= dy * 1.5;

            touchStart.x = touch.clientX;
            touchStart.y = touch.clientY;
        }
    }
});

view.addEventListener("touchend", e => {
    for (let touch of e.changedTouches) {
        if (touch.identifier === aimTouchId) {
            aimTouchId = null;
            touchStart = null;
        }
    }
});

btn.addEventListener("touchstart", e => {
    e.stopPropagation();
    e.preventDefault();

    if (toggle.innerText === "Single" && magazine > 0) {
        magazine--;
        if (magazine <= 0) {
            btn.disabled = true;
            btn.innerHTML =
                '<img src="https://raw.githubusercontent.com/Mohammed-Asim-developer/Shooting_game_src/refs/heads/main/magazine_reload.png" width="24" height="24"/>';
            reload();
        }
        shoot();
    } else if (!interval && magazine > 0) {
        interval = setInterval(() => {
            magazine--;
            if (magazine <= 0) {
                btn.innerHTML =
                    '<img src="https://raw.githubusercontent.com/Mohammed-Asim-developer/Shooting_game_src/refs/heads/main/magazine_reload.png" width="24" height="24"/>';
                btn.disabled = true;
                clearInterval(interval);
                interval = null;
                reload();
            }
            shoot();
        }, 100);
    }
});

btn.addEventListener("touchend", () => {
    clearInterval(interval);
    interval = null;
});

toggle.addEventListener("touchstart", e => {
    e.stopPropagation();
    e.preventDefault();
    toggle.innerText = toggle.innerText === "Single" ? "Auto" : "Single";
});
/* =========================
               9️⃣ LOOP
            ========================= */

function animate() {
    requestAnimationFrame(animate);
    checkOrientation();
    moveTarget();
    limitAim();
    renderer.render(scene, camera);
}
animate();
// ====== ضبط حجم الريندر عند تغيير حجم الشاشة ======
/* window.addEventListener("resize", () => {

                        });*/
