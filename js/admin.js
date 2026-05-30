// =====================================================
// ADMIN PANEL - crea sport/squadre/utenti/partite
// =====================================================

import { requireRole } from "./auth.js";
import { formatSport } from "./sports.js";
import {
    db,
    collection,
    doc,
    addDoc,
    deleteDoc,
    onSnapshot,
    orderBy,
    query,
    Timestamp
} from "./firebase-config.js";

const session = requireRole("admin");
if (!session) throw new Error("not authorized");

function escapeHtml(s) {
    return String(s ?? "").replace(/[&<>"']/g, c => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
}

const sportNameInp    = document.getElementById("sportName");
const sportIconInp    = document.getElementById("sportIcon");
const addSportBtn     = document.getElementById("addSportBtn");
const sportsList      = document.getElementById("sportsList");

const teamNameInp     = document.getElementById("teamName");
const addTeamBtn      = document.getElementById("addTeamBtn");
const teamsList       = document.getElementById("teamsList");

const userUsername    = document.getElementById("userUsername");
const userPassword    = document.getElementById("userPassword");
const userRole        = document.getElementById("userRole");
const addUserBtn      = document.getElementById("addUserBtn");
const usersList       = document.getElementById("usersList");

const matchSport      = document.getElementById("matchSport");
const matchTeam1      = document.getElementById("matchTeam1");
const matchTeam2      = document.getElementById("matchTeam2");
const matchDate       = document.getElementById("matchDate");
const matchGiornata   = document.getElementById("matchGiornata");
const addMatchBtn     = document.getElementById("addMatchBtn");
const matchesTable    = document.getElementById("matchesTable");

let teamsCache = [];
let sportsCache = [];

addSportBtn.addEventListener("click", async () => {
    const name = sportNameInp.value.trim();
    const icon = sportIconInp.value.trim() || "🏅";
    if (!name) return;

    await addDoc(collection(db, "sports"), { name, icon });
    sportNameInp.value = "";
    sportIconInp.value = "";
});

addTeamBtn.addEventListener("click", async () => {
    const name = teamNameInp.value.trim();
    if (!name) return;
    await addDoc(collection(db, "teams"), { name });
    teamNameInp.value = "";
});

addUserBtn.addEventListener("click", async () => {
    const username = userUsername.value.trim();
    const password = userPassword.value;
    const role     = userRole.value;

    if (!username || !password) return;

    await addDoc(collection(db, "users"), { username, password, role, teamId: null });
    userUsername.value = "";
    userPassword.value = "";
});

addMatchBtn.addEventListener("click", async () => {
    const sportId = matchSport.value;
    const t1 = matchTeam1.value;
    const t2 = matchTeam2.value;
    const dateStr = matchDate.value;
    const giornata = Number(matchGiornata.value) || 1;

    if (!sportId) {
        alert("Seleziona uno sport");
        return;
    }
    if (!t1 || !t2) return;
    if (t1 === t2) {
        alert("Le squadre devono essere diverse");
        return;
    }

    const sport = sportsCache.find(s => s.id === sportId);
    const team1 = teamsCache.find(t => t.id === t1);
    const team2 = teamsCache.find(t => t.id === t2);

    await addDoc(collection(db, "matches"), {
        sportId,
        sportName: sport?.name || "",
        sportIcon: sport?.icon || "🏅",
        team1Id: t1,
        team2Id: t2,
        team1Name: team1?.name || "",
        team2Name: team2?.name || "",
        score1: 0,
        score2: 0,
        status: "upcoming",
        matchDate: dateStr ? Timestamp.fromDate(new Date(dateStr)) : Timestamp.now(),
        giornata,
        elapsedSeconds: 0,
        startTime: null
    });

    matchDate.value = "";
    matchGiornata.value = "";
});

onSnapshot(query(collection(db, "sports"), orderBy("name")), (snap) => {
    sportsCache = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    sportsList.innerHTML = sportsCache.map(s => `
        <li>
            <span>${escapeHtml(s.icon || "🏅")} ${escapeHtml(s.name)}</span>
            <button class="btn btn-danger" data-del-sport="${s.id}">🗑</button>
        </li>
    `).join("");

    const opts = ['<option value="">-- Seleziona sport --</option>',
        ...sportsCache.map(s =>
            `<option value="${s.id}">${escapeHtml(s.icon || "🏅")} ${escapeHtml(s.name)}</option>`
        )];
    matchSport.innerHTML = opts.join("");

    sportsList.querySelectorAll("[data-del-sport]").forEach(btn => {
        btn.addEventListener("click", () =>
            deleteDoc(doc(db, "sports", btn.dataset.delSport))
        );
    });
});

onSnapshot(collection(db, "teams"), (snap) => {
    teamsCache = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    teamsList.innerHTML = teamsCache.map(t => `
        <li>
            <span>${escapeHtml(t.name)}</span>
            <button class="btn btn-danger" data-del-team="${t.id}">🗑</button>
        </li>
    `).join("");

    const opts = teamsCache.map(t => `<option value="${t.id}">${escapeHtml(t.name)}</option>`).join("");
    matchTeam1.innerHTML = opts;
    matchTeam2.innerHTML = opts;

    teamsList.querySelectorAll("[data-del-team]").forEach(btn => {
        btn.addEventListener("click", () =>
            deleteDoc(doc(db, "teams", btn.dataset.delTeam))
        );
    });
});

onSnapshot(collection(db, "users"), (snap) => {
    usersList.innerHTML = snap.docs.map(d => {
        const u = d.data();
        return `
        <li>
            <span>${escapeHtml(u.username)} - <em>${escapeHtml(u.role)}</em></span>
            <button class="btn btn-danger" data-del-user="${d.id}">🗑</button>
        </li>`;
    }).join("");

    usersList.querySelectorAll("[data-del-user]").forEach(btn => {
        btn.addEventListener("click", () =>
            deleteDoc(doc(db, "users", btn.dataset.delUser))
        );
    });
});

onSnapshot(query(collection(db, "matches"), orderBy("giornata")), (snap) => {
    matchesTable.innerHTML = snap.docs.map(d => {
        const m = d.data();
        return `
        <tr>
            <td data-label="Sport">${escapeHtml(formatSport(m) || "-")}</td>
            <td data-label="Squadre">${escapeHtml(m.team1Name)} vs ${escapeHtml(m.team2Name)}</td>
            <td data-label="Giornata">${m.giornata ?? "-"}</td>
            <td data-label="Stato">${escapeHtml(m.status)}</td>
            <td data-label=""><button class="btn btn-danger" data-del-match="${d.id}">🗑 Elimina</button></td>
        </tr>`;
    }).join("");

    matchesTable.querySelectorAll("[data-del-match]").forEach(btn => {
        btn.addEventListener("click", () =>
            deleteDoc(doc(db, "matches", btn.dataset.delMatch))
        );
    });
});
