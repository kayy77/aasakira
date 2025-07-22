
export function getMinAIConfidence(confluenceLevel: number): number {
  switch (confluenceLevel) {
    case 6: return 85; // institutional level
    case 5: return 80;
    case 4: return 75;
    case 3: return 65; // slightly risky but acceptable
    default: return 70;
  }
}

export function getRiskLevel(confluenceScore: number): 'Low' | 'Moderate' | 'High' | 'Critical' {
  if (confluenceScore >= 6) return 'Low';
  if (confluenceScore >= 5) return 'Moderate';
  if (confluenceScore >= 4) return 'High';
  return 'Critical';
}

export function getRiskMessage(confluenceScore: number): string {
  if (confluenceScore < 4) {
    return "⚠️ Risky entry – low confluence, use tighter SL and monitor.";
  }
  return "✅ Strong setup based on confluence tier.";
}
