export async function summarizeText(text: string): Promise<string> {
  return text.split('.').slice(0, 5).join('.') + '.';
}
