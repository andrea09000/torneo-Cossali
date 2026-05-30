// =====================================================
// NAVBAR: inietta header/footer condivisi in ogni pagina
// =====================================================

import { getSession, logout } from "./auth.js";

function navActive(href) {
    const path = window.location.pathname.split("/").pop() || "index.html";
    const target = href.split("/").pop();
    if (target === "telecomando.html" &&
        (path === "telecomando.html" || path === "telecomando-match.html")) {
        return "active";
    }
    return path === target ? "active" : "";
}

export function renderNavbar() {
    const session = getSession();
    const canRemote = session && (session.role === "campo" || session.role === "admin");

    const loginLink = session
        ? `<a class="nav-link" href="#" id="logoutBtn">🚪 Logout (${session.username})</a>`
        : `<a class="nav-link" href="login.html">🔑 Login</a>`;

    const adminLink = session && session.role === "admin"
        ? `<li><a class="nav-link" href="admin.html">⚙️ Admin</a></li>` : "";

    const remoteLink = canRemote
        ? `<li><a class="nav-link" href="telecomando.html">🎮 Telecomando</a></li>` : "";

    const bottomRemote = canRemote
        ? `<a href="telecomando.html" class="bottom-link ${navActive("telecomando.html")}"><div>🎮</div>Campo</a>`
        : "";

    const bottomAdmin = session && session.role === "admin"
        ? `<a href="admin.html" class="bottom-link ${navActive("admin.html")}"><div>⚙️</div>Admin</a>`
        : "";

    const bottomLogin = !session
        ? `<a href="login.html" class="bottom-link ${navActive("login.html")}"><div>🔑</div>Login</a>`
        : "";

    const html = `
    <nav class="navbar-custom">
        <a class="navbar-brand" href="index.html">⚽ Torneo Cossali</a>
        <button class="nav-toggler" id="navToggler" type="button" aria-label="Menu" aria-expanded="false">☰</button>
        <ul class="nav-links" id="navLinks">
            <li><a class="nav-link" href="index.html">🏠 Home</a></li>
            <li><a class="nav-link" href="tv.html">📺 LIVE</a></li>
            ${remoteLink}
            ${adminLink}
            <li>${loginLink}</li>
        </ul>
    </nav>

    <div class="bottom-nav">
        <a href="index.html" class="bottom-link ${navActive("index.html")}"><div>🏠</div>Home</a>
        <a href="tv.html" class="bottom-link ${navActive("tv.html")}"><div>🔴</div>Live</a>
        ${bottomRemote}
        ${bottomAdmin}
        ${bottomLogin}
    </div>
    `;

    const mount = document.getElementById("navbar-mount");
    if (mount) mount.innerHTML = html;

    const toggler = document.getElementById("navToggler");
    const links = document.getElementById("navLinks");

    if (toggler && links) {
        toggler.addEventListener("click", () => {
            const open = links.classList.toggle("open");
            toggler.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            logout();
        });
    }
}

document.addEventListener("DOMContentLoaded", renderNavbar);
