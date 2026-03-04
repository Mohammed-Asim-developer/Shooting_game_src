/* =========================
               1️⃣ IMPORTS
            ========================= */
//import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.182.0/build/three.module.js";
import * as THREE from "./three.module.js";
/* =========================
               2️⃣ DOM SETUP
            ========================= */
const view = document.createElement("canvas"),
    btn = document.createElement("button"),
    toggle = document.createElement("button"),
    spanHits = document.createElement("span"),
    spanFails = document.createElement("span"),
    bulletView = document.createElement("div"),
    bullet = document.createElement("img"),
    magazine_reload = document.createElement("img"),
    bestscore = document.createElement("span"),
    bullets = [];
function setupDOM() {
    view.width = window.innerWidth;
    view.height = window.innerHeight;
    view.style.display = "block";
    view.style.touchAction = "none";

    document.body.style.margin = 0;
    bulletView.style.cssText =
        "width:80%; height:5%;position:fixed;bottom:1%;right:0;background:rgba(0,0,0,0.3);display:flex;justify-content:flex-start;align-items:center;overflow:hidden";
    magazine_reload.src = "./magazine_reload.png";
    // "https://raw.githubusercontent.com/Mohammed-Asim-developer/Shooting_game_src/refs/heads/main/magazine_reload.png";
    bullet.src ="https://raw.githubusercontent.com/Mohammed-Asim-developer/Shooting_game_src/refs/heads/main/bullet_icon.png";
    //"./bullet_icon.png";
    bulletHolder();
    magazine_reload.width = "24";
    magazine_reload.height = "24";
    bullet.width = "24";
    bullet.height = "24";
    btn.appendChild(bullet);

    toggle.innerText = "Single";

    spanHits.innerText = "Hits : 0";
    spanFails.innerText = "Fails : 0";
    bestscore.innerText = "Best Score : 0";

    btn.style.cssText =
        "width:3rem;height:3rem;border-radius:100%;position:fixed;bottom:10px;left:10px";

    toggle.style.cssText =
        "width:3rem;height:3rem;border-radius:100%;position:fixed;bottom:80px;left:10px";

    spanHits.style.cssText =
        "position:fixed;top:10px;left:20px;white-space:nowrap";
    bestscore.style.cssText = `width:fit-content; position:fixed;top:10px;left:50%;transform:translateX(-50%);white-space:nowrap`;

    spanFails.style.cssText =
        "position:fixed;top:10px;right:20px;white-space:nowrap";

    document.body.append(
        view,
        btn,
        toggle,
        spanHits,
        spanFails,
        bestscore,
        bulletView
    );
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
// أرضية
const groundTexture = textureLoader.load(
        "./map.gif"
        //"https://raw.githubusercontent.com/Mohammed-Asim-developer/Shooting_game_src/refs/heads/main/map.gif"
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
            "./colorful-archery-target-r8cy205o48r3zoue.png.webp"
            //"https://raw.githubusercontent.com/Mohammed-Asim-developer/Shooting_game_src/refs/heads/main/colorful-archery-target-r8cy205o48r3zoue.png.webp"
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
console.log(aim);
// فتحة الرصاصة (template)
const holeTemplate = new THREE.Mesh(
    new THREE.CircleGeometry(10, 64),
    new THREE.MeshBasicMaterial({
        map: textureLoader.load(
            "./BulletHole.png"
            // "https://raw.githubusercontent.com/Mohammed-Asim-developer/Shooting_game_src/refs/heads/main/BulletHole.png"
        )
    })
);

// السلاح
const weaponHolder = new THREE.Mesh(
    new THREE.PlaneGeometry(4, 2.5),
    new THREE.MeshBasicMaterial({
        map: textureLoader.load(
            "./hand-with-gun-png.png"
            //"https://raw.githubusercontent.com/Mohammed-Asim-developer/Shooting_game_src/refs/heads/main/hand-with-gun-png.png"
        ),
        transparent: true
    })
);

// الصوت
const listener = new THREE.AudioListener(),
    shootSound = new THREE.Audio(listener),
    reloadSound = new THREE.Audio(listener);
camera.add(listener);

let reisLoaded = false;
let isLoaded = false;
audioLoader.load(
    "./ShootingSound.mp3",
    //"https://raw.githubusercontent.com/Mohammed-Asim-developer/Shooting_game_src/refs/heads/main/ShootingSound.mp3",
    buffer => {
        shootSound.setBuffer(buffer);
        shootSound.setVolume(1);
        shootSound.setLoop(false);
        isLoaded = true;
    }
);
audioLoader.load(
    "./reload_sound.mp3",
    // "https://raw.githubusercontent.com/Mohammed-Asim-developer/Shooting_game_src/refs/heads/main/reload_sound.mp3",
    buffer => {
        reloadSound.setBuffer(buffer);
        reloadSound.setVolume(1);
        reloadSound.setLoop(false);
        reisLoaded = true;
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

    camera.position.set(0, 0, ground1.geometry.parameters.height / 2 - 1.5);

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
    aimTouchId = null;
/* =========================
               7️⃣ GAME LOGIC
            ========================== */

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

// حفظ أفضل نتيجة
function saveBestScore(score) {
    const best = localStorage.getItem("bestScore") || 0;
    if (score > best) {
        localStorage.setItem("bestScore", score);
        console.log("New best score saved!");
    }
}

// جلب أفضل نتيجة عند تحميل الصفحة
const bestScore = localStorage.getItem("bestScore") || 0;
bestscore.innerText = `Best score: ${bestScore}`;

function shoot() {
    const distance = aim.position.distanceTo(target.position);

    if (distance <= radius) {
        scene.remove(target);
        speed++;
        setTimeout(() => scene.add(target), 2000);
        updateCounter(spanHits);
        if (
            parseInt(localStorage.getItem("bestScore")) <
            parseInt(spanHits.innerText.split(":")[1])
        ) {
            saveBestScore(spanHits.innerText.split(":")[1]);
            updateCounter(bestscore);
        }
    } else {
        updateCounter(spanFails);
        createBulletHole();
    }

    recoil();

    if (isLoaded) {
        if (shootSound.isPlaying) shootSound.stop();
        shootSound.clone().play();
    }
}

function reload() {
    if (reisLoaded) {
        if (reloadSound.isPlaying) reloadSound.stop();
        reloadSound.play();
    }

    magazine_reload.style.transition = "none";
    magazine_reload.style.transform = "rotate(0deg)";

    // إجبار المتصفح على إعادة الحساب
    void magazine_reload.offsetWidth;

    magazine_reload.style.transition = "transform 4s linear";
    magazine_reload.style.transform = "rotate(360deg)";

    setTimeout(() => {
        bulletHolder();
        btn.disabled = false;
        btn.removeChild(magazine_reload);
        btn.appendChild(bullet);
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

function bulletHolder() {
    bullets.length = 0;
    for (let i = 0; i < 30; i++) {
        bullets.push(bullet.cloneNode());
    }
    bullets.forEach(bullet => {
        bullet.style.cssText =
            "height:50%;transform:rotateZ(-40deg)rotateY(0deg);padding:0;margin:0";
        bulletView.appendChild(bullet);
    });
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

    if (toggle.innerText === "Single" && bullets.length > 0) {
        bullets.pop(bullet);
        bulletView.removeChild(bulletView.lastChild);
        if (bullets.length <= 0) {
            btn.disabled = true;
            btn.removeChild(bullet);
            btn.appendChild(magazine_reload);
            reload();
        }
        shoot();
    } else if (!interval && bullets.length > 0) {
        interval = setInterval(() => {
            bullets.pop(bullet);
            bulletView.removeChild(bulletView.lastChild);
            if (bullets.length <= 0) {
                btn.disabled = true;
                btn.removeChild(bullet);
                btn.appendChild(magazine_reload);
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
window.addEventListener("resize", () => {
    checkOrientation();
});
checkOrientation();
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
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("./sw.js")
            .then(reg => console.log("SW registered", reg))
            .catch(err => console.error("SW registration failed", err));
    });
}
