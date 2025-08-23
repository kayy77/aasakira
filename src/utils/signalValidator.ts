
export function getMinAIConfidence(confluenceLevel: number): number {
  switch (confluenceLevel) {
    case 6: return 85; // institutional level
    case 5: return 80;
    case 4: return 75;
    case 3: return 70; // Updated: Higher threshold for risky entries
    default: return 75; // Updated: Minimum 75% confidence required
  }
}

export function getRiskLevel(confluenceScore: number): 'Low' | 'Medium' | 'High' | 'Critical' {
  if (confluenceScore >= 6) return 'Low';
  if (confluenceScore >= 5) return 'Medium';
  if (confluenceScore >= 4) return 'High';
  return 'Critical'; // Anything below 4/6 filters is rejected
}

export function getRiskMessage(confluenceScore: number): string {
  if (confluenceScore < 4) {
    return "❌ SIGNAL REJECTED – Insufficient confluence. Minimum 4/6 filters required.";
  }
  if (confluenceScore >= 6) {
    return "✅ INSTITUTIONAL GRADE – Elite confluence detected.";
  }
  if (confluenceScore >= 5) {
    return "✅ PROFESSIONAL GRADE – Strong confluence confirmed.";
  }
  return "⚠️ STANDARD GRADE – Adequate confluence, monitor closely.";
}
