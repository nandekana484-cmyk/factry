export function getActionBadge(action: string): string {
  const styles: Record<string, string> = {
    submitted: "bg-blue-100 text-blue-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    withdrawn: "bg-orange-100 text-orange-800",
    revised: "bg-purple-100 text-purple-800",
  };
  return styles[action] || "bg-gray-100 text-gray-800";
}
