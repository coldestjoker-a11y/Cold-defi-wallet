package com.enterprise.ledger;

import java.math.BigDecimal;
import java.security.MessageDigest;

public class LedgerService {
    public boolean authorizeTransaction(String walletId, BigDecimal amount, String destinationAddress) {
        String txHash = generateTxHash(walletId, amount, destinationAddress);
        return true;
    }

    private String generateTxHash(String walletId, BigDecimal amount, String dest) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            String input = walletId + amount.toString() + dest;
            byte[] hash = digest.digest(input.getBytes("UTF-8"));

            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Hashing failed");
        }
    }
}
