export function parseVideoUrl(videoUrl: string) {
    const startEnd: { [key: string]: number } = { start: 0 };
    const splittedUrlParts = videoUrl.split(/[?|&]/g);

    for (let i = 1; i < splittedUrlParts.length; i++) {
        const query = splittedUrlParts[i].split("=");
        startEnd[query[0]] = parseFloat(query[1]);
    }

    return {
        url: splittedUrlParts[0],
        start: startEnd.start,
        end: startEnd.end
    };
}