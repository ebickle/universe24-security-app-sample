import assert from 'node:assert/strict';
import { describe, test, beforeEach } from 'node:test';
import sinon from 'sinon';
import { createIssueOnce } from '../../common/issues.js';

const owner = 'sample-owner';
const repo = 'sample-repo';
const existingTitle = 'Existing issue 1';

describe('createIssueOnce', () => {
    let octokitStub;
    let createIssueStub;

    beforeEach(() => {
        const listIssuesForRepoStub = sinon.stub()
            .withArgs({
                owner,
                repo,
                state: 'open',
                labels: sinon.match.any
            })
            .resolves([
                {
                    title: existingTitle,
                    html_url: `https://github.com/${owner}/${repo}/issues/1`
                }
            ]);

        createIssueStub = sinon.stub();
        
        octokitStub = {
            rest: {
                issues: {
                    listForRepo: listIssuesForRepoStub,
                    create: createIssueStub
                }
            },
            log: {
                info: sinon.stub()
            },
            paginate: (func, arg) => func(arg)
        };
    });
    
    test('creates new issue', async () => {
        const newTitle = 'New issue';
        const newBody = 'New body';
        const labels = [ 'label1' ];
        
        await createIssueOnce(octokitStub, owner, repo, newTitle, newBody, labels);
        createIssueStub.calledOnceWithExactly({
            owner,
            repo,
            newTitle,
            newBody,
            labels
        });
    });

    test('does not create new issue when a match exists', async () => {
        await createIssueOnce(octokitStub, owner, repo, existingTitle, '', null);
        assert(createIssueStub.notCalled);
    });
});