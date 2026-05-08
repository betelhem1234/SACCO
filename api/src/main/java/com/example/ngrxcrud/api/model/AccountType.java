package com.example.ngrxcrud.api.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum AccountType {
    ASSET(1),
    LIABILITY(2),
    EQUITY(3),
    REVENUE(4),
    EXPENSE(5);

    private final int code;

    AccountType(int code) {
        this.code = code;
    }

    @JsonValue
    public int getCode() {
        return code;
    }

    @JsonCreator
    public static AccountType fromCode(int code) {
        for (AccountType t : values()) {
            if (t.code == code) {
                return t;
            }
        }
        throw new IllegalArgumentException("Unknown account type code: " + code);
    }
}
