import dotenv from 'dotenv'
import fs from 'fs'
import http from 'http'
import { Octokit, App } from 'octokit'
import { createNodeMiddleware } from '@octokit/webhooks'

import * as alertStatusAuthorization from './behaviors/alert-status-authorization.js'
import * as workflowFailures from './behaviors/workflow-failures.js'

// Load environment variables from .env file
dotenv.config();

// Set configured values
const appId = process.env.APP_ID;
const privateKeyPath = process.env.PRIVATE_KEY_PATH;
const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
const secret = process.env.WEBHOOK_SECRET;
const enterpriseHostname = process.env.ENTERPRISE_HOSTNAME;

// Create an authenticated Octokit client authenticated as a GitHub App
const app = new App({
    appId,
    privateKey,    
    webhooks: {
        secret
    },
    log: console,
    ...(enterpriseHostname && {
        Octokit: Octokit.defaults({
            baseUrl: `https://${enterpriseHostname}/api/v3`
        })
    })
});

// Verify the app can successfully authenticate
const { data } = await app.octokit.request('/app');
app.octokit.log.debug(`Authenticated as '${data.name}'`);

// Get an octokit instance authenticated with the organization containing the repository where issues will be created.
const { data: issueOrgInstallation } = await app.octokit.rest.apps.getOrgInstallation({ org: process.env.ISSUE_ORG });
const issueOctokit = await app.getInstallationOctokit(issueOrgInstallation.id);

// Register event handlers
app.webhooks.on('code_scanning_alert.closed_by_user', (event) => alertStatusAuthorization.codeScanningAlertClosedByUser({ ...event, issueOctokit }));
app.webhooks.on('dependabot_alert.dismissed', (event) => alertStatusAuthorization.dependabotAlertDismissed({ ...event, issueOctokit }));
app.webhooks.on('secret_scanning_alert.resolved', (event) => alertStatusAuthorization.secretScanningAlertResolved({ ...event, issueOctokit }));
app.webhooks.on('workflow_run.completed', (event) => workflowFailures.workflowRunCompleted({ ...event, issueOctokit }));

// Optional: Handle errors
app.webhooks.onError((error) => {
    if (error.name === 'AggregateError') {
        // Log Secret verification errors
        console.log(`Error processing request: ${error.event}`)
    } else {
        console.log(error)
    }
});

// Launch a web server to listen for GitHub webhooks
const port = process.env.PORT || 3000;
const path = '/api/webhook';

const middleware = createNodeMiddleware(app.webhooks, { path });

http.createServer(middleware).listen(port, () => {
    console.log(`Server is listening for events at: http://localhost:${port}${path}`)
    console.log('Press Ctrl + C to quit.')
});
