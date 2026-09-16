package com.example.ngrxcrud.api.model;

/**
 * State machine for a withdrawal record.
 *
 * <pre>
 *                    (approval &amp; disbursement off: posts immediately)
 *   New Withdrawal ─────────────────────────────────────────────▶ POSTED
 *        │
 *        ├─(approval off, disbursement on)
 *        │      PRE-APPROVED               DISBURSED
 *        └▶ APPROVED ────disburse────────▶ (ledger)
 *
 *   (approval on, disbursement off)
 *   PENDING ──approve──▶ POSTED (ledger)
 *
 *   (approval on, disbursement on)
 *   PENDING ──approve──▶ APPROVED ──disburse──▶ DISBURSED (ledger)
 *      │
 *      └──reject──▶ REJECTED
 * </pre>
 *
 * Ledger impact (debit saving account, credit bank, negative saving entry)
 * happens at POSTED or DISBURSED. PENDING and REJECTED can be edited or
 * deleted; APPROVED rows are locked awaiting disbursement.
 */
public enum WithdrawalStatus {
    PENDING,
    APPROVED,
    POSTED,
    DISBURSED,
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

    public boolean canDisburse() {
        return this == APPROVED;
    }

    public boolean canReject() {
        return this == PENDING;
    }

    public boolean canEdit() {
        return this == PENDING || this == REJECTED;
    }

    public boolean canDelete() {
        return this == PENDING || this == REJECTED;
    }

    public boolean postsToLedger() {
        return this == POSTED || this == DISBURSED;
    }
}