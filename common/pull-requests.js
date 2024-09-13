export function parsePullRequestRef(ref) {
    const matches = /^refs\/pull\/(\d+)\/merge$/.exec(ref);
    if (matches) {
        return parseInt(matches[1], 10);
    }
    return null;
}