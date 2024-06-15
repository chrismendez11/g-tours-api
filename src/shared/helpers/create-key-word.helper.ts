export function createKeyWord(name: string): string {
  const cleanName = name.trim().replace(/\s+/g, ' ');
  const keyWord = cleanName.toUpperCase().replace(/ /g, '_');

  return keyWord;
}
