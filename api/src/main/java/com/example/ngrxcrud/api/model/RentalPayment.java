package com.example.ngrxcrud.api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "rental_payments")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class RentalPayment {

    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.UUID)
    private UUID id;

    @Column(name = "contract_id")
    private UUID contractId;

    @Column(name = "property_name")
    private String propertyName;

    private String frequency;

    @Column(name = "amount_per_period")
    private Double amountPerPeriod;

    @Column(name = "paid_from", nullable = false)
    private Long paidFrom;

    @Column(name = "paid_to", nullable = false)
    private Long paidTo;

    @Column(name = "amount_paid", nullable = false)
    private Double amountPaid;

    @Column(name = "pay_date", nullable = false)
    private Long payDate;

    @Column(name = "paid_by")
    private String paidBy;

    @Column(name = "payment_account_id")
    private UUID paymentAccountId;

    @Column(name = "expensed_through")
    private Long expensedThrough;

    private String note;

    @Column(name = "created_at")
    private Long createdAt;
}