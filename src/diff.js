export function compareText(actual, expected) {
  const actualLines = actual.split('\n');
  const expectedLines = expected.split('\n');
  const max = Math.max(actualLines.length, expectedLines.length);
  const diff = [];
  for (let index = 0; index < max; index += 1) {
    if (actualLines[index] === expectedLines[index]) continue;
    diff.push({
      line: index + 1,
      expected: expectedLines[index] ?? '',
      actual: actualLines[index] ?? ''
    });
  }
  return { passed: diff.length === 0, diff };
}
