/** Same trimming rules as the legacy HTML panel (`PanelView`). */
export function formatPanelAmount(value: number): string {
  if (!Number.isFinite(value)) return '0';
  const fixed = value.toFixed(2);
  return fixed.replace(/\.?0+$/, '');
}
