export interface Course {
  credit: number;
  weight: number; // ör: AA için 4.0
}

export interface AgnoResult {
  totalCredits: number;
  totalPoints: number;
  gpa: number | null; // Kredi yoksa null
}

export function calculateAGNO(courses: Course[]): AgnoResult {
  let totalCredits = 0;
  let totalPoints = 0;

  for (const course of courses) {
    // Negatif veya geçersiz NaN (Not a Number) girişleri güvenli hale getir
    const credit = isNaN(course.credit) ? 0 : Math.max(0, course.credit);
    const weight = isNaN(course.weight) ? 0 : Math.max(0, course.weight);

    totalCredits += credit;
    totalPoints += credit * weight;
  }

  // Not ortalamasını virgülden sonra 2 basamağa yuvarla
  const gpa = totalCredits > 0 ? Math.round((totalPoints / totalCredits) * 100) / 100 : null;

  return {
    totalCredits,
    totalPoints,
    gpa
  };
}
