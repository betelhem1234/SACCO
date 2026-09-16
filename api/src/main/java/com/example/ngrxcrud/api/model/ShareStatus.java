package com.example.ngrxcrud.api.model;

/**
 * State machine for share subscription and purchase records.
 *
 * <pre>
 *                    (auto, approval disabled)
 *   New Share Record ───────────────────────────▶ POSTED
 *        │
 *        │ (approval enabled)
 *        ▼
 *     PENDING ──approve──▶ POSTED
 *        │                    │
 *        └────reject──────▶ REJECTED
 *
 *   POSTED ──reverse──▶ PENDING (un-posts from ledger, back to review)
 * </pre>
 *
 * Only POSTED records are effective: purchases are posted to the ledger
 * (debit bank, credit share purchase & registration fee accounts) and only
 * POSTED records count toward authorized capital, subscription caps and the
 * share purchase report. PENDING and REJECTED records can be edited or
 * deleted; POSTED records are locked.
 */
public enum ShareStatus {
    PENDING,
    POSTED,
    REJECTED;

    /**
     * Resolves a stored value, defaulting null (legacy rows created before the
     * status column existed) to POSTED since they were applied immediately.
     */
    public static ShareStatus resolve(ShareStatus status) {
        return status != null ? status : POSTED;
    }

    public boolean canApprove() {
        return this == PENDING;
    }

    public boolean canReject() {
        return this == PENDING;
    }

    public boolean canReverse() {
        return this == POSTED;
    }

    public boolean canEdit() {
        return this != POSTED;
    }

    public boolean canDelete() {
        return this != POSTED;
    }

    public boolean postsToLedger() {
        return this == POSTED;
    }
}