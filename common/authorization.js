export function isSecurityReviewer(username) {
    // TODO: Externalize to configuration
    const securityReviewers = ['octocat', 'monalisa'];
    return securityReviewers.includes(username);
}
