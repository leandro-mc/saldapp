import com.lmora.saldapp.domain.model.Balance;
import com.lmora.saldapp.domain.model.Transaction;
import com.lmora.saldapp.domain.service.SettlementCalculator;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Reference implementation used to generate the frontend's parity fixtures.
 * It runs the real backend SettlementCalculator and a copy of the HashMap-based balance logic from
 * GroupFinancialUseCaseImp.calculateGroupBalances, so the expected values come from Java, not from us.
 *
 * Input, one scenario per line (amounts in cents):
 *   G id,id,id | payerId:cents,payerId:cents   -> group: balances + settlements
 *   S id:cents,id:cents                          -> settlements for raw balances
 * Output, one JSON object per line.
 */
public class Oracle {

    public static void main(String[] args) throws Exception {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        String line;
        while ((line = in.readLine()) != null) {
            if (line.isBlank()) continue;
            String kind = line.substring(0, 1);
            String rest = line.substring(1).trim();
            List<Balance> balances = kind.equals("G") ? groupBalances(rest) : rawBalances(rest);

            String balancesJson = kind.equals("G") ? toJson(balances) : "[]";   // before calculate() mutates them
            List<Transaction> transactions = SettlementCalculator.calculate(balances);

            System.out.println("{\"balances\":" + balancesJson + ",\"settlements\":" + toJson(transactions) + "}");
        }
    }

    private static BigDecimal cents(String text) {
        return BigDecimal.valueOf(Long.parseLong(text), 2);
    }

    private static List<Balance> rawBalances(String text) {
        List<Balance> balances = new ArrayList<>();
        if (text.isEmpty()) return balances;
        for (String pair : text.split(",")) {
            String[] parts = pair.split(":");
            balances.add(new Balance(Long.parseLong(parts[0]), BigDecimal.ZERO, cents(parts[1])));
        }
        return balances;
    }

    // Copy of GroupFinancialUseCaseImp.calculateGroupBalances (same collections, same rounding).
    private static List<Balance> groupBalances(String text) {
        String[] sides = text.split("\\|", -1);
        List<Long> integrantsIds = new ArrayList<>();
        for (String id : sides[0].trim().split(",")) integrantsIds.add(Long.parseLong(id.trim()));

        List<Long> payers = new ArrayList<>();
        List<BigDecimal> amounts = new ArrayList<>();
        if (!sides[1].isBlank()) {
            for (String pair : sides[1].trim().split(",")) {
                String[] parts = pair.split(":");
                payers.add(Long.parseLong(parts[0]));
                amounts.add(cents(parts[1]));
            }
        }

        BigDecimal totalExpenses = amounts.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal equalShare = totalExpenses.divide(BigDecimal.valueOf(integrantsIds.size()), 2, RoundingMode.HALF_UP);

        Map<Long, BigDecimal> groupBalances = new HashMap<>();
        Map<Long, BigDecimal> totalPaidByIntegrant = new HashMap<>();
        for (Long id : integrantsIds) {
            groupBalances.put(id, equalShare.negate());
            totalPaidByIntegrant.put(id, BigDecimal.ZERO);
        }
        for (int i = 0; i < payers.size(); i++) {
            groupBalances.merge(payers.get(i), amounts.get(i), BigDecimal::add);
            totalPaidByIntegrant.merge(payers.get(i), amounts.get(i), BigDecimal::add);
        }

        return groupBalances.entrySet().stream()
                .map(entry -> new Balance(entry.getKey(), totalPaidByIntegrant.get(entry.getKey()), entry.getValue()))
                .collect(Collectors.toList());
    }

    private static long toCents(BigDecimal value) {
        return value.movePointRight(2).longValueExact();
    }

    private static String toJson(List<?> items) {
        return items.stream().map(item -> {
            if (item instanceof Balance b) {
                return "[" + b.getIntegrantId() + "," + toCents(b.getTotalPaid()) + "," + toCents(b.getBalance()) + "]";
            }
            Transaction t = (Transaction) item;
            return "[" + t.getFromIntegrantId() + "," + t.getToIntegrantId() + "," + toCents(t.getAmount()) + "]";
        }).collect(Collectors.joining(",", "[", "]"));
    }
}
