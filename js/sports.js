export function formatSport(match) {
    if (!match?.sportName) return "";
    const icon = match.sportIcon || "🏅";
    return `${icon} ${match.sportName}`;
}
