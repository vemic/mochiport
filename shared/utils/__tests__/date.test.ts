import { formatDate } from '../date';

describe('date utils', () => {
  test('formatDate formats date string correctly', () => {
    // テスト対象の関数を呼び出し、結果を検証
    const testDate = new Date('2025-06-05T12:00:00Z');
    const result = formatDate(testDate.toISOString());
    expect(result).toMatch(/\d{4}[-/]\d{2}[-/]\d{2}/); // 基本的な日付形式の検証
  });
});
