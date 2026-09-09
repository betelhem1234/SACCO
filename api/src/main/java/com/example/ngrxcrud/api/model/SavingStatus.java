package com.example.ngrxcrud.api.model;

/**
 * State machine for a saving record.
 *
 * <pre>
 *                    (auto, approval disabled)
 *   New Saving ───────────────────────────────▶ POSTED
 *        │
 *        │ (approval enabled)
 *        ▼
 *     PENDING ──approve──▶ POSTED
 *        │
 *        └────reject──────▶ REJECTED
 * </pre>
 *
 * Only POSTED records are posted to the ledger. PENDING and REJECTED records
 * can be edited or deleted; POSTED records are locked.
 */
public enum SavingStatus {
    PENDING,
    POSTED,
    REJECTED;

    /**
     * Resolves a stored value, defaulting null (legacy rows created before the
     * status column existed) to POSTED since they were already posted to the ledger.
     */
    public static SavingStatus resolve(SavingStatus status) {
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
