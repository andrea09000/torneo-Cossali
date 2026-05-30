// =====================================================
// TV LIVE - scoreboard real-time
// =====================================================

import {
    db,
    collection,
    doc,
    query,
    where,
    orderBy,
    limit,
    onSnapshot
} from "./firebase-config.js";
import { formatSport } from "./sports.js";

const tvContainer = document.getElementById("tvContainer");

function escapeHtml(s) {
    return String(s ?? "").replace(/[&<>"']/g, c => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
}

function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? "0" : ""}${sec}`;
}

let currentMatch = null;

function computeSeconds(match) {
    const base = match.elapsedSeconds || 0;
    if (match.status === "live" && match.startTime) {
        const start = match.startTime.toDate
            ? match.startTime.toDate()
            : new Date(match.startTime);
        const diff = Math.floor((Date.now() - start.getTime()) / 1000);
        return base + diff;
    }
    return base;
}

function render() {
    if (!currentMatch) {
        tvContainer.innerHTML = '<div class="empty-msg">NESSUNA PARTITA IN CORSO</div>';
        return;
    }

    const m = currentMatch;
    const seconds = computeSeconds(m);

    const liveBadge = m.status === "live" ? "🔴 LIVE"
                   : m.status === "paused"   ? "⏸ PAUSA"
                   : m.status === "finished" ? "✅ FINITA" : "🕒 IN ATTESA";

    const sportLabel = formatSport(m);

    tvContainer.innerHTML = `
        <div class="scoreboard">
            ${sportLabel ? `<div class="sport-badge">${escapeHtml(sportLabel)}</div>` : ""}
            <div class="teams">
                <div class="team">${escapeHtml(m.team1Name)}</div>
                <div class="score">${m.score1 || 0} - ${m.score2 || 0}</div>
                <div class="team">${escapeHtml(m.team2Name)}</div>
            </div>
            <div class="status">⏱ <span class="time">${formatTime(seconds)}</span> • ${liveBadge}</div>
        </div>
    `;
}

setInterval(() => {
    if (currentMatch) render();
}, 1000);

const q = query(
    collection(db, "matches"),
    where("status", "in", ["live", "paused", "upcoming"]),
    orderBy("matchDate"),
    limit(1)
);

let unsubMatch = null;

onSnapshot(q, (snap) => {
    if (snap.empty) {
        currentMatch = null;
        render();
        return;
    }

    const docSnap = snap.docs[0];
    currentMatch = { id: docSnap.id, ...docSnap.data() };
    render();

    if (unsubMatch) unsubMatch();
    unsubMatch = onSnapshot(doc(db, "matches", currentMatch.id), (s) => {
        if (s.exists()) {
            currentMatch = { id: s.id, ...s.data() };
            render();
        }
    });
});
