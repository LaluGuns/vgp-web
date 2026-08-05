export interface LeadScoutIssue {
    path: string;
    code:
        | 'invalid-value'
        | 'missing-evidence'
        | 'missing-source-url'
        | 'missing-observed-at'
        | 'future-observation'
        | 'guessed-contact'
        | 'invalid-contact'
        | 'unverified-beat'
        | 'unsafe-license';
    message: string;
}

export class LeadScoutValidationError extends Error {
    readonly issues: LeadScoutIssue[];

    constructor(issues: LeadScoutIssue[]) {
        super(`Lead Scout candidate rejected with ${issues.length} validation issue(s).`);
        this.name = 'LeadScoutValidationError';
        this.issues = issues;
    }
}
