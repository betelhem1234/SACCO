package com.example.ngrxcrud.api.jpa;

import com.example.ngrxcrud.api.model.AccountCategory;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class AccountCategoryConverter implements AttributeConverter<AccountCategory, Integer> {

    @Override
    public Integer convertToDatabaseColumn(AccountCategory attribute) {
        return attribute == null ? null : attribute.getCode();
    }

    @Override
    public AccountCategory convertToEntityAttribute(Integer dbData) {
        return dbData == null ? null : AccountCategory.fromCode(dbData);
    }
}
