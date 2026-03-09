export function getActionLabel(action: string): string {
  const labels: Record<string, string> = {
    submitted: "提出",
    approved: "承認",
    rejected: "差し戻し",
    withdrawn: "引き戻し",
    revised: "改定開始",
  };
  return labels[action] || action;
}
