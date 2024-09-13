import { isSecurityReviewer } from '../common/authorization.js';
import { createIssueOnce } from '../common/issues.js';

export async function dependabotAlertDismissed({ payload, octokit, issueOctokit }) {
    const { alert, repository } = payload;

    octokit.log.info(`User ${alert.dismissed_by.login} dismissed Dependabot alert ${alert.html_url}.`);

    if (!isSecurityReviewer(alert.dismissed_by.login)) {
        octokit.log.warn(`User ${alert.dismissed_by.login} is not authorized to resolve Dependabot alert ${alert.html_url}.`);

        // Reopen the Dependabot alert
        octokit.log.info(`Reopening Dependabot alert ${alert.html_url}.`);
        await octokit.rest.dependabot.updateAlert({
            owner: repository.owner.login,
            repo: repository.name,
            alert_number: alert.number,
            state: 'open'
        });

        // Create an issue so that the security team can follow up with the user
        await createIssueOnce(
            issueOctokit,
            process.env.ISSUE_ORG,
            process.env.ISSUE_REPO,            
            `Dependabot alert reopened for ${repository.full_name} (#${alert.number})`,
            'A Dependabot alert was automatically reopened after a user attempted to dismiss it.\n\n' +
                `**Dismissed by:** ${alert.dismissed_by.login}\n` +
                `**Repository:** [${repository.full_name}](${repository.html_url})\n` +
                `**Alert:** ${alert.html_url}\n` +
                `**Summary:** ${alert.security_advisory?.summary}\n` +
                `**Severity:** ${alert.security_advisory?.severity}\n` +
                `**Package:** ${alert.dependency?.package?.name} (${alert.dependency?.package?.ecosystem})`,
            ['alert reopened', 'dependabot']);        
    }
}

export async function codeScanningAlertClosedByUser({ payload, octokit, issueOctokit }) {
    const { alert, repository } = payload;
    octokit.log.info(`User ${alert.dismissed_by.login} dismissed code scanning alert ${alert.html_url}.`);

    if (alert.state === 'dismissed' && !isSecurityReviewer(alert.dismissed_by.login)) {
        octokit.log.warn(`User ${alert.dismissed_by.login} is not authorized to resolve code scanning alert ${alert.html_url}.`);

        // Reopen the code scanning alert
        octokit.log.info(`Reopening code scanning alert ${alert.html_url}.`);
        await octokit.rest.codeScanning.updateAlert({
            owner: repository.owner.login,
            repo: repository.name,
            alert_number: alert.number,
            state: 'open'
        });

        // Create an issue so that the security team can follow up with the user
        await createIssueOnce(
            issueOctokit,
            process.env.ISSUE_ORG,
            process.env.ISSUE_REPO,            
            `${alert.tool.name} alert reopened for ${repository.full_name} (#${alert.number})`,
            'A code scanning alert was automatically reopened after a user attempted to dismiss it.\n\n' +
                `**Dismissed by:** ${alert.dismissed_by.login}\n` +
                `**Repository:** [${repository.full_name}](${repository.html_url})\n` +
                `**Alert:** ${alert.html_url}\n` +
                `**Tool:** ${alert.tool.name}\n` +
                `**Rule:** ${alert.rule.id} - ${alert.rule.description}`,
            ['alert reopened', 'code scanning']);
    }
}

export async function secretScanningAlertResolved({ payload, octokit, issueOctokit }) {
    const { alert, repository } = payload;

    // Editing a custom secret scanning alert pattern will close and reopen the alert.
    if (alert.resolution === 'pattern_edited') {
        return;
    }

    octokit.log.info(`User ${alert.resolved_by.login} resolved secret scanning alert ${alert.html_url}.`);

    if (alert.resolution === 'revoked' && alert.validity === 'inactive') {
        // All users are authorized to revoke alerts that the secret scanning partner 
        // has verified as being inactive.
        octokit.log.info(`Alert ${alert.html_url} is verified as being revoked.`);
    } else if (!isSecurityReviewer(alert.resolved_by.login)) {
        octokit.log.warn(`User ${alert.resolved_by.login} is not authorized to dismiss secret scanning alert ${alert.html_url}.`);

        // Reopen the secret scanning alert
        octokit.log.info(`Reopening secret scanning alert ${alert.html_url}.`);
        await octokit.rest.secretScanning.updateAlert({
            owner: repository.owner.login,
            repo: repository.name,
            alert_number: alert.number,
            state: 'open'
        });

        // Create an issue so that the security team can follow up with the user
        await createIssueOnce(
            issueOctokit,
            process.env.ISSUE_ORG,
            process.env.ISSUE_REPO,            
            `Secret scanning alert reopened for ${repository.full_name} (#${alert.number})`,
            'A secret scanning alert was automatically reopened after a user attempted to resolve it.\n\n' +
                `**Resolved by:** ${alert.resolved_by.login}\n` +
                `**Repository:** [${repository.full_name}](${repository.html_url})\n` +
                `**Alert:** ${alert.html_url}\n` +
                `**Secret type:** ${alert.secret_type}`,
            ['alert reopened', 'secret scanning']);
    }
}
