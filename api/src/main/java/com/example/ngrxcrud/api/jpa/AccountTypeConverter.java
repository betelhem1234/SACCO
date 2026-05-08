package com.example.ngrxcrud.api.jpa;

import com.example.ngrxcrud.api.model.AccountType;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class AccountTypeConverter implements AttributeConverter<AccountType, Integer> {

    @Override
    public Integer convertToDatabaseColumn(AccountType attribute) {
        return attribute == null ? null : attribute.getCode();
    }

    @Override
    public AccountType convertToEntityAttribute(Integer dbData) {
        return dbData == null ? null : AccountType.fromCode(dbData);
    }
}
