/**
 * Computes the scale factor to fit a rectangle inside the viewport.
 * Never returns a value greater than 1 (only scales down to fit).
 */
export function getFitScale(
  contentWidth: number,
  contentHeight: number,
  viewportWidth: number,
  viewportHeight: number,
  maxScale: number = 1
): number {
  if (contentWidth <= 0 || contentHeight <= 0) return maxScale;
  const scaleX = viewportWidth / contentWidth;
  const scaleY = viewportHeight / contentHeight;
  return Math.min(maxScale, scaleX, scaleY);
}

/**
 * Resets positioning and transform on an element so its natural size can be measured.
 */
export function resetLayoutStyles(element: HTMLElement): void {
  element.style.position = '';
  element.style.top = '';
  element.style.left = '';
  element.style.transform = 'none';
  element.style.transformOrigin = 'center center';
}

/**
 * Applies a scaled, viewport-centered layout to the element.
 * Use when scale < 1 to fit content in the viewport and keep it centered.
 */
export function applyScaledCenteredLayout(
  element: HTMLElement,
  scale: number
): void {
  if (scale >= 1) {
    resetLayoutStyles(element);
    return;
  }
  element.style.position = 'fixed';
  element.style.top = '50%';
  element.style.left = '50%';
  element.style.transformOrigin = 'center center';
  element.style.transform = `translate(-50%, -50%) scale(${scale})`;
}
