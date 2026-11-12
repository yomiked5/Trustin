// A finite, reversible story. No timers, wheel interception or automatic advance.
export const chapterStops = [0, .34, .60, .88];
export function tourFrame(progress) {
  const p = Math.max(0, Math.min(1, Number.isFinite(progress) ? progress : 0));
  const t = Math.min(1, p / .22);
  const shrink = t * t * (3 - 2 * t);
  const chapter = p < .24 ? -1 : p < .49 ? 0 : p < .74 ? 1 : 2;
  return { shrink, chapter, intro: 1 - Math.min(1, p / .14) };
}
export function tourProgress(top, height, stageHeight, stickyTop) {
  const travel = Math.max(1, height - stageHeight);
  return Math.max(0, Math.min(1, (stickyTop - top) / travel));
}
export function connectorPath(start, end, vertical) {
  if (vertical) {
    const middle = (start.y + end.y) / 2;
    return `M${start.x},${start.y} C${start.x},${middle} ${end.x},${middle} ${end.x},${end.y}`;
  }
  const middle = (start.x + end.x) / 2;
  return `M${start.x},${start.y} C${middle},${start.y} ${middle},${end.y} ${end.x},${end.y}`;
}
