package com.example.ngrxcrud.api.model;

/**
 * Where the transfer service fee is paid from.
 * <ul>
 *   <li>NONE  - no service fee applies (fee disabled or zero)</li>
 *   <li>SAVING - the fee is deducted from the source member's savings</li>
 *   <li>BANK  - the fee is paid through the selected bank account</li>
 * </ul>
 */
public enum TransferFeeSource {
    NONE,
    SAVING,
    BANK;

    public static TransferFeeSource resolve(TransferFeeSource source) {
        return source != null ? source : NONE;
    }
}