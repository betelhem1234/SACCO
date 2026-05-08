package com.example.ngrxcrud.api.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum AccountCategory {
    BANK_ACCOUNT(1),
    CASH_ACCOUNT(2),
    OTHER_ACCOUNT(3);

    private final int code;

    AccountCategory(int code) {
        this.code = code;
    }

    @JsonValue
    public int getCode() {
        return code;
    }

    @JsonCreator
    public static AccountCategory fromCode(int code) {
        for (AccountCategory c : values()) {
            if (c.code == code) {
                return c;
            }
        }
        throw new IllegalArgumentException("Unknown account category code: " + code);
    }
}
