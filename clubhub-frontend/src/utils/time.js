export function formatDateTime(value, options = { dateStyle: "medium", timeStyle: "short" }) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat(undefined, options).format(date);
}

export function formatDate(value) {
    return formatDateTime(value, { dateStyle: "medium" });
}

export function formatRelative(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const diffMs = date.getTime() - Date.now();
    const abs = Math.abs(diffMs);
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    let unit;
    if (abs < minute) unit = "just now";
    else if (abs < hour) unit = `${Math.round(abs / minute)}m`;
    else if (abs < day) unit = `${Math.round(abs / hour)}h`;
    else unit = `${Math.round(abs / day)}d`;

    if (unit === "just now") return unit;
    return diffMs >= 0 ? `in ${unit}` : `${unit} ago`;
}

/** Convert an ISO timestamp to the value expected by <input type="datetime-local">. */
export function toLocalInputValue(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const pad = (n) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
