// =====================================================
// SPLASH SCREEN - logo + barra di caricamento iniziale
// =====================================================

const MIN_DISPLAY_MS = 1400;
const startTime = Date.now();
const bar = document.getElementById("splashBar");

let progress = 0;
const tick = setInterval(() => {
    if (progress < 88) {
        progress += Math.random() * 6 + 2;
        bar.style.width = Math.min(progress, 88) + "%";
    }
}, 120);

function hideSplash() {
    clearInterval(tick);
    bar.style.width = "100%";

    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed);

    setTimeout(() => {
        const splash = document.getElementById("splash-screen");
        splash.classList.add("splash-hide");
        document.body.classList.remove("splash-active");

        setTimeout(() => splash.remove(), 500);
    }, remaining + 250);
}

if (document.readyState === "complete") {
    hideSplash();
} else {
    window.addEventListener("load", hideSplash);
}
