import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { parsePullRequestRef } from '../../common/pull-requests.js';

describe('parsePullRequestRef', () => {
    test('returns pull request id when match found', () => {
        assert.equal(parsePullRequestRef('refs/pull/1234/merge'), 1234);
        assert.equal(parsePullRequestRef('refs/pull/0987/merge'), 987);
    });

    test('returns null when no match found', () => {
        assert.equal(parsePullRequestRef(), null);
        assert.equal(parsePullRequestRef(null), null);
        assert.equal(parsePullRequestRef(''), null);
        assert.equal(parsePullRequestRef('refs/pull/abcd/merge'), null);
    });
});