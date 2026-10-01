import { describe, it, expect } from 'vitest';
import { calculateYearlySalary, SalaryParams } from '../src/lib/calculate-salary';
import taxRates from '../src/data/tax-rates.json';

const params: SalaryParams = taxRates as SalaryParams;

describe('calculateYearlySalary (Maaş Hesaplayıcı)', () => {
  it('1. Asgari ücretli birinin gelir ve damga vergisi tam istisna olmalı (0 çıkmalı)', () => {
    const results = calculateYearlySalary(params.gross_minimum_wage, params);
    
    for (const month of results) {
      expect(month.payableIncomeTax).toBe(0);
      expect(month.payableStampTax).toBe(0);
      // Net maaş küsurat farklılıkları için çok yakın olmalı
      expect(Math.abs(month.netSalary - 28075.50)).toBeLessThan(0.1); 
    }
  });

  it('2. Asgari ücretin altında maaş girilirse (örn: part-time) vergiler yine 0 olmalı', () => {
    const results = calculateYearlySalary(15000, params);
    
    expect(results[0].payableIncomeTax).toBe(0);
    expect(results[0].payableStampTax).toBe(0);
    expect(results[0].exemptionIncomeTax).toBeGreaterThanOrEqual(results[0].calculatedIncomeTax);
  });

  it('3. SGK Tavanını aşan çok yüksek maaşlarda SGK kesintisi tavandan sabitlenmeli', () => {
    const extremeSalary = 400000; // Tavan 297,270
    const results = calculateYearlySalary(extremeSalary, params);
    
    // Beklenen maksimum SGK kesintisi (297270 * %14)
    const maxSgkDeduction = params.sgk_ceiling * params.sgk_worker_rate;
    
    expect(results[0].sgkDeduction).toBeCloseTo(maxSgkDeduction, 2);
    expect(results[0].sgkBase).toBe(params.sgk_ceiling);
  });

  it('4. Asgari ücretin biraz üstü maaş alan biri vergi dilimi atlattığında istisna doğru çalışmalı', () => {
    // 35.000 TL maaş
    const results = calculateYearlySalary(35000, params);
    
    // Kümülatif matrahlar arttıkça gelir vergisi oluşmaya başlayacak
    // Fakat istisna da kümülatif arttığı için net düşüşler hesaplanmalı
    expect(results[0].payableIncomeTax).toBeGreaterThan(0);
    expect(results[0].payableStampTax).toBeGreaterThan(0);
    
    // Ay geçtikçe vergi dilimi değişebilir, bu yüzden 12. ayın vergisi 1. aydan yüksek olmalı
    expect(results[11].payableIncomeTax).toBeGreaterThanOrEqual(results[0].payableIncomeTax);
  });

  it('5. 12 aylık kümülatif gelir vergisi matrahı doğru artmalı', () => {
    const results = calculateYearlySalary(50000, params);
    
    let expectedCumulative = 0;
    for (const month of results) {
      expectedCumulative += month.incomeTaxBase;
      expect(month.cumulativeIncomeTaxBase).toBeCloseTo(expectedCumulative, 2);
    }
  });
});
