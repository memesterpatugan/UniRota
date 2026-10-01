import { describe, it, expect } from 'vitest';
import { generateICS } from '../src/lib/ics';

describe('ICS Generator (src/lib/ics.ts)', () => {
  it('1. Standart formatta geçerli ICS stringi üretir', () => {
    const result = generateICS('YKS 2026', '2026-06-21T10:15:00');
    expect(result).toContain('BEGIN:VCALENDAR');
    expect(result).toContain('SUMMARY:YKS 2026');
    expect(result).toContain('END:VCALENDAR');
  });

  it('2. Aylar ve günleri her zaman 2 haneli (0 padded) olacak şekilde formatlar', () => {
    // 5 Mayıs -> 05
    const result = generateICS('Test Sınavı', '2026-05-05');
    // Mayıs (05), Gün (05) -> 20260505
    expect(result).toContain('DTSTART:20260505T071500Z');
  });

  it('3. Yılbaşı/Yıl değişimi geçişlerini doğru okur', () => {
    const result = generateICS('ALES/1', '2027-01-01');
    expect(result).toContain('DTSTART:20270101');
  });

  it('4. Artık yılları (Leap Year) bozulmadan işler', () => {
    const result = generateICS('Özel Sınav', '2024-02-29');
    expect(result).toContain('DTSTART:20240229T071500Z');
  });

  it('5. Başlangıç saatini (DTSTART) standart ÖSYM UTC formatında (07:15) üretir', () => {
    const result = generateICS('YDS/1', '2026-04-18');
    expect(result).toContain('DTSTART:20260418T071500Z');
  });

  it('6. Bitiş saatini (DTEND) standart ÖSYM UTC formatında (09:45) üretir', () => {
    const result = generateICS('YDS/1', '2026-04-18');
    expect(result).toContain('DTEND:20260418T094500Z');
  });

  it('7. Zorunlu VCALENDAR meta etiketlerini (VERSION, PRODID) içerir', () => {
    const result = generateICS('KPSS', '2026-09-06');
    expect(result).toContain('VERSION:2.0');
    expect(result).toContain('PRODID:-//');
  });

  it('8. Farklı sınav isimlerini (Açıklama ve Başlık) event içine doğru yerleştirir', () => {
    const result = generateICS('TUS 2. Dönem', '2026-10-15');
    expect(result).toContain('SUMMARY:TUS 2. Dönem');
    expect(result).toContain('DESCRIPTION:TUS 2. Dönem Sınavı');
  });
});
