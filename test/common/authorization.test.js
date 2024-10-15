import assert from 'node:assert/strict';
import { describe, test, beforeEach, afterEach } from 'node:test';
import { isSecurityReviewer } from '../../common/authorization.js';

describe('isSecurityReviewer', () => {
    let envBackup;

    beforeEach(() => {
        envBackup = process.env.SECURITY_REVIEWERS;
    });

    afterEach(() => {
        process.env.SECURITY_REVIEWERS = envBackup;
    });

    test('throws error when SECURITY_REVIEWERS is not set', () => {
        delete process.env.SECURITY_REVIEWERS;
        assert.throws(() => isSecurityReviewer('user1'), {
            message: 'SECURITY_REVIEWERS environment variable is not set'
        });
    });

    test('returns true for a security reviewer', () => {
        process.env.SECURITY_REVIEWERS = ' USER1, user2, user3 ';
        assert.equal(isSecurityReviewer('user1'), true);
        assert.equal(isSecurityReviewer('USER2'), true);
    });

    test('returns false for a non-security reviewer', () => {
        process.env.SECURITY_REVIEWERS = ' USER1, user2, user3 ';
        assert.equal(isSecurityReviewer('user4'), false);
    });
});