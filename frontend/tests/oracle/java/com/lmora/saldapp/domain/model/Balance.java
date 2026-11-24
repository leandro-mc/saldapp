package com.lmora.saldapp.domain.model;

import java.math.BigDecimal;

// Plain-Java stand-in for the Lombok-generated backend class (same constructor, getters and setters),
// so the real SettlementCalculator.java compiles here without Lombok or Maven.
public class Balance {
    private Long integrantId;
    private BigDecimal totalPaid;
    private BigDecimal balance;

    public Balance(Long integrantId, BigDecimal totalPaid, BigDecimal balance) {
        this.integrantId = integrantId;
        this.totalPaid = totalPaid;
        this.balance = balance;
    }

    public Long getIntegrantId() { return integrantId; }
    public BigDecimal getTotalPaid() { return totalPaid; }
    public BigDecimal getBalance() { return balance; }
    public void setBalance(BigDecimal balance) { this.balance = balance; }
}
