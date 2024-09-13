export async function createIssueOnce(octokit, owner, repo, title, body, labels) {
    const issues = await octokit.paginate(octokit.rest.issues.listForRepo, {
        owner,
        repo,
        state: 'open',
        labels
    });

    const existingIssue = issues.find(i => i.title === title);
    if (existingIssue) {
        octokit.log.info(`Issue ${existingIssue.html_url} already exists in ${owner}/${repo}.`);
        return;
    }

    octokit.log.info(`Creating issue '${title}' in ${owner}/${repo}`);
    await octokit.rest.issues.create({
        owner,
        repo,
        title,
        body,
        labels
    });
}