export async function checkResponse(response) {
    if (!response.ok) {
        throw new Error(`${errorMessage}: ${response.status}`);
    }
    return await response.json();
}

export function formatDuration(milliseconds) {
    if (!milliseconds) return null;
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (num) => String(num).padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export function formatDate(date) {
    return new Date(date).toLocaleString();
}

export const playerColors = {
    0: '#027EE8',
    1: '#ff0000',
    2: '#008000',
    3: '#d1b600',
    4: '#0dcaf0',
    5: '#ff00ff',
    6: '#999999',
    7: '#ff8201',
    8: '#000000',
    9: '#000000',
    10: '#000000',
    11: '#0000ff',
    12: '#ffff00',
    13: '#ffffff',
    14: '#ff0000'
};