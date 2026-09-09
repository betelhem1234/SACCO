package com.example.ngrxcrud.api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "saving_types")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class SavingType {
    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.UUID)
    private java.util.UUID id;
    private String name;
    private java.util.UUID accountId;
    private String description;

    /**
     * Marks this saving type as the mandatory saving type. Mandatory types have
     * their minimum amount changes preserved in {@link SavingTypeAmountHistory}
     * so that member payments are checked against the amount that was in effect
     * on the payment date.
     */
    @Getter(AccessLevel.NONE)
    @Setter(AccessLevel.NONE)
    @Column(name = "is_mandatory", columnDefinition = "boolean default false")
    private boolean isMandatory = false;

    /**
     * Minimum amount members must pay for this saving type. For the mandatory
     * type the effective minimum is resolved from the history table by payment
     * date; for all other types the current value here is used directly.
     */
    @Column(name = "minimum_amount", columnDefinition = "double precision default 0")
    private Double minimumAmount = 0.0;

    public boolean getIsMandatory() {
        return isMandatory;
    }

    public void setIsMandatory(boolean mandatory) {
        isMandatory = mandatory;
    }
}