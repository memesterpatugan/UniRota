export function generateICS(examName: string, dateStr: string): string {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  // Türkiye saati ile 10:15 -> UTC 07:15
  // Bitiş 12:45 -> UTC 09:45
  const dtStart = `${year}${month}${day}T071500Z`;
  const dtEnd = `${year}${month}${day}T094500Z`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Ogrenci Araclari//Sınav Takvimi//TR',
    'BEGIN:VEVENT',
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${examName}`,
    `DESCRIPTION:${examName} Sınavı`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}
