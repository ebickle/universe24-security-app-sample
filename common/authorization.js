export function isSecurityReviewer(username) {
    if (!process.env.SECURITY_REVIEWERS) {
        throw new Error('SECURITY_REVIEWERS environment variable is not set');
    }

    const securityReviewers = process.env.SECURITY_REVIEWERS.split(',').map(r => r.trim().toLowerCase());
    return securityReviewers.includes(username.toLowerCase());
}
