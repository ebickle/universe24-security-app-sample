import { createIssueOnce } from '../common/issues.js';

export async function workflowRunCompleted({ payload, octokit, issueOctokit }) {
    const { workflow_run: workflowRun, workflow, repository } = payload;
    
    if (workflowRun.conclusion === 'failure' && 
        workflowRun.head_repository.id === repository.id &&
        workflowRun.head_branch === repository.default_branch
    ) {
        const workflowPaths = getWorkflowPaths(workflowRun);
        if (workflowPaths.some(isCodeQLPath)) {
            octokit.log.info(`CodeQL workflow run ${workflowRun.html_url} failed.`);

            await createIssueOnce(
                issueOctokit,
                process.env.ISSUE_ORG,
                process.env.ISSUE_REPO,
                `CodeQL workflow failure for ${repository.full_name}`,
                'A CodeQL workflow failed to complete successfully.\n\n' +
                    `**Repository:** [${repository.full_name}](${repository.html_url})\n` +
                    `**Workflow:** [${workflow.path}](${workflow.html_url})\n` +
                    `**Workflow name:** ${workflow.name}\n` +
                    `**Workflow run:** ${workflowRun.html_url}`,
                ['workflow failure','code scanning']
            );
        }        
    }
}

function getWorkflowPaths(workflowRun) {
    let paths = [workflowRun.path];

    if (workflowRun.referenced_workflows) {
        workflowRun.referenced_workflows.forEach(r => paths.push(r.path.split('@')[0]));
    }

    return paths;
}

function isCodeQLPath(path) {
    // Default setup workflow
    if (path === 'dynamic/github-code-scanning/codeql') {
        return true;
    }

    // Custom CodeQL workflows
    return path.toLowerCase().includes('.github/workflows/codeql');
}
