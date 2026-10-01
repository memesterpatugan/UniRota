import { describe, it, expect } from 'vitest';
import { calculateYearlySalary } from '../src/lib/calculate-salary';
import taxRates from '../src/data/tax-rates.json';

describe('Maaş Hesaplayıcı (src/lib/calculate-salary.ts)', () => {
  it('1. Geçerli standart bir maaş hesaplar (Örn: 50.000 TL)', () => {
    const result = calculateYearlySalary(50000, taxRates);
    expect(result.length).toBe(12);
    expect(result[0].gross).toBe(50000);
    // SGK kesintisi: %14 (7000) + %1 (500) = 7500
    // Net vergisiz matrah: 42500
    // İstisna düşülünce Ocak ayı net > 35000 olmalı
    expect(result[0].netSalary).toBeGreaterThan(35000);
  });

  it('2. Sıfır maaş veya negatif girildiğinde 0 brütle işlem yapmalı', () => {
    const result = calculateYearlySalary(-1000, taxRates);
    expect(result.length).toBe(12);
    expect(result[0].gross).toBe(0);
    expect(result[0].netSalary).toBe(0);
  });

  it('3. Çok büyük maaşlarda SGK Tavanını (297.270 TL) aşmaz', () => {
    const result = calculateYearlySalary(500000, taxRates);
    // SGK işçi payı max = 297270 * 0.14 = 41617.8
    expect(result[0].sgkDeduction).toBeCloseTo(41617.8, 1);
  });

  it('4. Asgari ücretli birinde Gelir Vergisi 0 olmalı (Tam İstisna)', () => {
    const minWage = taxRates.gross_minimum_wage;
    const result = calculateYearlySalary(minWage, taxRates);
    expect(result[0].payableIncomeTax).toBe(0);
    expect(result[0].payableStampTax).toBe(0);
    // Net asgari ücret = 28075.50
    expect(result[0].netSalary).toBeCloseTo(taxRates.net_minimum_wage, 1);
  });

  it('5. Yıl sonuna doğru kümülatif matrah dilim atladığında vergi artar', () => {
    const result = calculateYearlySalary(70000, taxRates);
    // Ocak ayındaki gelir vergisi ile Aralık ayındaki gelir vergisi farklı olmalı
    expect(result[11].payableIncomeTax).toBeGreaterThan(result[0].payableIncomeTax);
  });

  it('6. Asgari ücretten düşük maaş girildiğinde kısmi SGK/Vergi hesaplar (Part-time vb)', () => {
    const result = calculateYearlySalary(20000, taxRates);
    expect(result[0].payableIncomeTax).toBe(0); // Yine istisna sınırında kalacağı için vergi 0 olmalı
  });

  it('7. Kümülatif Vergi Matrahı aylar geçtikçe doğru toplanır', () => {
    const result = calculateYearlySalary(100000, taxRates);
    // SGK kesintisi 15000 (14 + 1)
    // Matrah 85000
    expect(result[0].cumulativeIncomeTaxBase).toBe(85000);
    expect(result[1].cumulativeIncomeTaxBase).toBe(170000);
  });

  it('8. Sınır değer: Gelir vergisi en üst dilime (%40) kadar ulaşır', () => {
    const result = calculateYearlySalary(5000000, taxRates); // Aylık 5 milyon
    // İkinci aya geçildiğinde matrah 5 milyonu geçeceği için %40 dilime girmeli
    // Dolayısıyla çok yüksek bir vergi kesilmeli
    expect(result[11].payableIncomeTax).toBeGreaterThan(1500000);
  });
});
