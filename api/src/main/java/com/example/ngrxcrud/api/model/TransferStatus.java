package com.example.ngrxcrud.api.model;

/**
 * State machine for a saving transfer record.
 *
 * <pre>
 *                       (approval off, fee-first off: posts immediately)
 *   New Transfer ────────────────────────────────────────────────────▶ POSTED
 *        │
 *        ├─(fee-first on, approval off)
 *        │   PENDING ──payFee──▶ FEE_PAID ──execute──▶ POSTED (ledger)
 *        │
 *        ├─(approval on, fee-first off)
 *        │   PENDING ──approve──▶ APPROVED ──execute──▶ POSTED (ledger)
 *        │
 *        └─(approval on, fee-first on)
 *            PENDING ──payFee──▶ FEE_PAID ──approve──▶ APPROVED ──execute──▶ POSTED
 *
 *   PENDING / FEE_PAID ──reject──▶ REJECTED
 * </pre>
 *
 * Ledger impact (debit source saving, credit destination saving, transfer
 * saving entries, and the service fee entries when enabled) happens only at
 * POSTED. The service fee entries are recorded at FEE_PAID when the
 * "fee first" payment stage is selected, otherwise together with the transfer
 * at POSTED.
 */
public enum TransferStatus {
    PENDING,
    FEE_PAID,
    APPROVED,
    POSTED,
    REJECTED;

    /**
     * Resolves a stored value, defaulting null (legacy rows created before the
     * status column existed) to POSTED since they were already posted to the ledger.
     */
    public static TransferStatus resolve(TransferStatus status) {
        return status != null ? status : POSTED;
    }

    /** Service fee can be paid from PENDING (the first stage). */
    public boolean canPayFee() {
        return this == PENDING;
    }

    /** Approval is only offered for requested / fee-paid transfers. */
    public boolean canApprove() {
        return this == PENDING || this == FEE_PAID;
    }

    /** The final transfer execution is offered on approved or fee-paid rows. */
    public boolean canExecute() {
        return this == APPROVED || this == FEE_PAID;
    }

    public boolean canReject() {
        return this == PENDING || this == FEE_PAID;
    }

    public boolean canEdit() {
        return this == PENDING || this == FEE_PAID || this == REJECTED;
    }

    public boolean canDelete() {
        return this == PENDING || this == FEE_PAID || this == REJECTED;
    }

    public boolean postsToLedger() {
        return this == POSTED;
    }
}