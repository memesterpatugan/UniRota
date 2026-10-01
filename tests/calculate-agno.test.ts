import { describe, it, expect } from 'vitest';
import { calculateAGNO } from '../src/lib/calculate-agno';

describe('calculateAGNO (AGNO Hesaplayıcı)', () => {
  it('1. Ders listesi boşsa GPA null (boş) dönmelidir', () => {
    const result = calculateAGNO([]);
    expect(result.gpa).toBeNull();
    expect(result.totalCredits).toBe(0);
    expect(result.totalPoints).toBe(0);
  });

  it('2. Tek dersin GPA hesabı doğru olmalıdır', () => {
    const result = calculateAGNO([{ credit: 3, weight: 4.0 }]);
    expect(result.gpa).toBe(4.00);
    expect(result.totalCredits).toBe(3);
    expect(result.totalPoints).toBe(12);
  });

  it('3. Birden fazla dersin GPA hesabı doğru yuvarlanmalıdır', () => {
    const result = calculateAGNO([
      { credit: 4, weight: 4.0 }, // 16
      { credit: 3, weight: 3.0 }, // 9
      { credit: 2, weight: 2.0 }, // 4
    ]);
    expect(result.gpa).toBe(3.22); // 29 / 9 = 3.222... -> 3.22 olmalı
    expect(result.totalCredits).toBe(9);
    expect(result.totalPoints).toBe(29);
  });

  it('4. Eksi (negatif) kredi girilirse yok saymalıdır (Sınır değer)', () => {
    const result = calculateAGNO([
      { credit: -5, weight: 4.0 },
      { credit: 3, weight: 4.0 }
    ]);
    expect(result.gpa).toBe(4.00);
    expect(result.totalCredits).toBe(3);
  });

  it('5. 0 kredili ders (Kredisiz zorunlu vb.) hesabı bozmamalıdır', () => {
    const result = calculateAGNO([
      { credit: 0, weight: 4.0 },
      { credit: 3, weight: 3.5 }
    ]);
    expect(result.gpa).toBe(3.50);
    expect(result.totalCredits).toBe(3);
  });

  it('6. Çok büyük kredi sayıları (Ekstrem değer) çökme yapmamalıdır', () => {
    const result = calculateAGNO([
      { credit: 100, weight: 4.0 },
      { credit: 100, weight: 3.0 }
    ]);
    expect(result.gpa).toBe(3.50);
    expect(result.totalCredits).toBe(200);
  });

  it('7. Bozuk veri (NaN) girilirse sıfır kabul edip hesabı patlatmamalıdır', () => {
    const result = calculateAGNO([
      { credit: NaN, weight: NaN },
      { credit: 3, weight: 4.0 }
    ]);
    expect(result.gpa).toBe(4.0);
  });

  it('8. Bütün dersler 0 kredili ise sonuç null olmalıdır (Sıfıra bölünme hatasını engelleme)', () => {
    const result = calculateAGNO([
      { credit: 0, weight: 4.0 },
      { credit: 0, weight: 3.5 }
    ]);
    expect(result.gpa).toBeNull();
  });
});
