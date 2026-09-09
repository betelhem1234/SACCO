package com.example.ngrxcrud.api.model;

/**
 * State machine for a withdrawal record.
 *
 * <pre>
 *                    (auto, approval disabled)
 *   New Withdrawal ────────────────────────────▶ POSTED
 *        │
 *        │ (approval enabled)
 *        ▼
 *     PENDING ──approve──▶ POSTED
 *        │
 *        └────reject──────▶ REJECTED
 * </pre>
 *
 * Only POSTED records are posted to the ledger (debit saving account, credit
 * bank, and the negative saving entry). PENDING and REJECTED records can be
 * edited or deleted; POSTED records are locked.
 */
public enum WithdrawalStatus {
    PENDING,
    POSTED,
    REJECTED;

    /**
     * Resolves a stored value, defaulting null (legacy rows created before the
     * status column existed) to POSTED since they were already posted to the ledger.
     */
    public static WithdrawalStatus resolve(WithdrawalStatus status) {
        return status != null ? status : POSTED;
    }

    public boolean canApprove() {
        return this == PENDING;
    }

    public boolean canReject() {
        return this == PENDING;
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
