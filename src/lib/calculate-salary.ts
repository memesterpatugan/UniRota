export interface TaxBracket {
  limit: number | null;
  rate: number;
}

export interface SalaryParams {
  gross_minimum_wage: number;
  sgk_worker_rate: number;
  unemployment_worker_rate: number;
  stamp_tax_rate: number;
  sgk_ceiling: number;
  brackets: TaxBracket[];
}

export interface MonthlyResult {
  month: number;
  gross: number;
  sgkBase: number;
  sgkDeduction: number;
  unemploymentDeduction: number;
  incomeTaxBase: number;
  cumulativeIncomeTaxBase: number;
  calculatedIncomeTax: number;
  exemptionIncomeTax: number;
  payableIncomeTax: number;
  calculatedStampTax: number;
  exemptionStampTax: number;
  payableStampTax: number;
  netSalary: number;
}

// Belirli bir kümülatif matrahın toplam vergisini hesaplar
function calculateTotalTax(cumulativeBase: number, brackets: TaxBracket[]): number {
  let tax = 0;
  let remaining = cumulativeBase;
  let previousLimit = 0;

  for (const bracket of brackets) {
    const limit = bracket.limit !== null ? bracket.limit : Infinity;
    const bracketSize = limit - previousLimit;
    
    if (remaining > bracketSize) {
      tax += bracketSize * bracket.rate;
      remaining -= bracketSize;
      previousLimit = limit;
    } else {
      tax += remaining * bracket.rate;
      break;
    }
  }
  return tax;
}

export function calculateYearlySalary(grossSalary: number, params: SalaryParams): MonthlyResult[] {
  const results: MonthlyResult[] = [];
  
  // Güvenlik: Negatif maaş girişlerini sıfır kabul et
  grossSalary = Math.max(0, grossSalary);

  let cumulativeBase = 0;
  let minWageCumulativeBase = 0;
  
  // Asgari ücretin aylık vergi matrahı sabittir (tavanı aşmaz)
  const minWageSgk = params.gross_minimum_wage * params.sgk_worker_rate;
  const minWageUnemp = params.gross_minimum_wage * params.unemployment_worker_rate;
  const minWageIncomeTaxBase = params.gross_minimum_wage - (minWageSgk + minWageUnemp);
  const minWageStampTax = params.gross_minimum_wage * params.stamp_tax_rate;

  for (let month = 1; month <= 12; month++) {
    // 1. SGK Hesaplamaları
    const sgkBase = Math.min(grossSalary, params.sgk_ceiling);
    const sgkDeduction = sgkBase * params.sgk_worker_rate;
    const unemploymentDeduction = sgkBase * params.unemployment_worker_rate;
    
    // 2. Gelir Vergisi Matrahı
    const incomeTaxBase = Math.max(0, grossSalary - (sgkDeduction + unemploymentDeduction));
    
    // 3. Kümülatif Matrahlar
    const prevCumulativeBase = cumulativeBase;
    cumulativeBase += incomeTaxBase;
    
    const prevMinWageCumulativeBase = minWageCumulativeBase;
    minWageCumulativeBase += minWageIncomeTaxBase;
    
    // 4. Gelir Vergisi Hesaplama (Bu ayın vergisi = Yeni kümülatif vergi - Eski kümülatif vergi)
    const currentTotalTax = calculateTotalTax(cumulativeBase, params.brackets);
    const prevTotalTax = calculateTotalTax(prevCumulativeBase, params.brackets);
    const calculatedIncomeTax = currentTotalTax - prevTotalTax;
    
    // 5. Asgari Ücret İstisnası (Aynı mantıkla asgari ücretin bu ayki vergisini buluyoruz)
    const currentMinWageTotalTax = calculateTotalTax(minWageCumulativeBase, params.brackets);
    const prevMinWageTotalTax = calculateTotalTax(prevMinWageCumulativeBase, params.brackets);
    const exemptionIncomeTax = currentMinWageTotalTax - prevMinWageTotalTax;
    
    // 6. Ödenecek Vergiler (İstisna düşüldükten sonra, eksiye düşemez)
    const payableIncomeTax = Math.max(0, calculatedIncomeTax - exemptionIncomeTax);
    
    const calculatedStampTax = grossSalary * params.stamp_tax_rate;
    // Damga vergisi istisnası asgari ücretlinin damga vergisi kadardır
    const payableStampTax = Math.max(0, calculatedStampTax - minWageStampTax);
    
    // 7. Net Maaş
    const netSalary = grossSalary - (sgkDeduction + unemploymentDeduction + payableIncomeTax + payableStampTax);
    
    results.push({
      month,
      gross: grossSalary,
      sgkBase,
      sgkDeduction,
      unemploymentDeduction,
      incomeTaxBase,
      cumulativeIncomeTaxBase: cumulativeBase,
      calculatedIncomeTax,
      exemptionIncomeTax,
      payableIncomeTax,
      calculatedStampTax,
      exemptionStampTax: minWageStampTax,
      payableStampTax,
      netSalary
    });
  }
  
  return results;
}
