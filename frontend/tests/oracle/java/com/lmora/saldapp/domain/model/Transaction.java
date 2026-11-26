package com.lmora.saldapp.domain.model;

import java.math.BigDecimal;

// Plain-Java stand-in for the Lombok-generated backend class.
public class Transaction {
    private Long fromIntegrantId;
    private Long toIntegrantId;
    private BigDecimal amount;

    public Transaction(Long fromIntegrantId, Long toIntegrantId, BigDecimal amount) {
        this.fromIntegrantId = fromIntegrantId;
        this.toIntegrantId = toIntegrantId;
        this.amount = amount;
    }

    public Long getFromIntegrantId() { return fromIntegrantId; }
    public Long getToIntegrantId() { return toIntegrantId; }
    public BigDecimal getAmount() { return amount; }
}
