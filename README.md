# Sample GitHub App for AppSec Scaling

This sample service demonstrates how to to implement a custom GitHub app to efficiently scale application security. Presented at the GitHub Universe 2024 session "[Go big! Efficiently deploy and customize security tooling at enterprise scale](https://reg.githubuniverse.com/flow/github/universe24/attendee-portal/page/sessioncatalog/session/1715360127550001lOUA)".

## Behaviors
The app implements the following sample behaviors:

* **Reopens GitHub Advanced Security alerts**

  When an unauthorized user dismisses a security alert (Dependabot, code scanning, or secret scanning), the alert will be reopened and a GitHub issue created so that the team can follow up.

* **Detects CodeQL default setup failures**

  When a workflow running CodeQL in default setup mode fails, a GitHub issue will be created so the security team can follow up.
  
* **Adds customized advice to pull requests that have code scanning alerts**

  When a specific type of new CodeQL alert is detected in a pull request, adds a comment with custom information.

## Requirements
* Node.js 20 or higher.

* A [GitHub app](https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/registering-a-github-app) subscribed to the following permissions and events:

    | Repository permission | Access |
    | ---------- | ------ |
    | Actions | Read-only | 
    | Code scanning alerts | Read and write |
    | Dependabot alerts | Read and write |
    | Issues | Read and write |
    | Secret Scanning Alerts | Read and write |

    | Event |
    | ----- |
    | Code scanning alert |
    | Dependabot alert |
    | Secret scanning alert |
    | Workflow run |

* The GitHub app's webhook server (this source code) must be configured to receive events at a URL that is accessible from the internet unless GitHub Enterprise Server is being used.

## Setup

1. Clone this repository

2. Create a `.env` file similar to `.env.sample` and set actual values.

    | Environment variable | Usage | Description |
    | -------------------- | ----- | ----------- |
    | `APP_ID` | Required | GitHub App id. |
    | `PRIVATE_KEY_PATH` | Required | Path to `.pem` file containign private key for GitHub app. Configured in GitHub app settings. |
    | `WEBHOOK_SECRET` | Required | Shared secret for webhooks. Configured in GitHub app settings. |
    | `ISSUE_ORG` | Required | Organization containing repository to create issues in. |
    | `ISSUE_REPO` | Required | Name of repository to create issues in. |
    | `PORT` | Optional | Listening port for server. Defaults to 3000. |
    | `ENTERPRISE_HOSTNAME` | Optional | Hostname of the GitHub Enterprise Server instance. If blank, GitHub Enterprise Cloud will be used. |

3. Install dependencies using `npm ci`.

4. Start the server with `npm run server`.

## Security considerations
To keep things simple for this example, the  GitHub application's private key (`PRIVATE_KEY_PATH`) and webhook secret (`WEBHOK_SECRET`) from the environment. Storing secrets in the environment variables and unencrypted files is **insecure**.

The secure and recommended approach is to use a secrets management system like Vault, or one offered by major cloud providers: Azure Key Vault, AWS Secrets Manager, Google Secret Manager, etc.

## References 
This repository is based on the sample code showcased in [github-app-js-sample](https://github.com/github/github-app-js-sample).