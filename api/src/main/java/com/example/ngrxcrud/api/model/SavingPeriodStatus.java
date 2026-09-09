package com.example.ngrxcrud.api.model;

public enum SavingPeriodStatus {
    PAID,
    PARTIAL,
    UNPAID;

    public static SavingPeriodStatus fromPaid(double paid, double required) {
        if (paid <= 0) return UNPAID;
        if (paid >= required) return PAID;
        return PARTIAL;
    }
}
