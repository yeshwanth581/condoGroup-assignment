import { ScoringMetrics } from "../types/repository";

interface RepoScoringData {
    stars: number;
    forks: number;
    lastUpdated: Date;
}

const MAX_STARS = 400000;
const MAX_FORKS = 250000;
const MAX_AGE = 365 * 2; // 2 years in days

// Initial weights for each metric
const initialWeights: Record<ScoringMetrics, number> = {
    stars: 0.5,
    forks: 0.3,
    recency: 0.2,
};

export const getIndividualScore = (
    repo: RepoScoringData,
    excludedScoreCriteria: ScoringMetrics[]
): Record<ScoringMetrics, { weight: number; value: number }> => {
    const ageInDays = (new Date().getTime() - repo.lastUpdated.getTime()) / (1000 * 60 * 60 * 24);

    // Normalize metrics
    const normalizedStars = Math.min(repo.stars / MAX_STARS, 1);
    const normalizedForks = Math.min(repo.forks / MAX_FORKS, 1);
    const normalizedAge = Math.min(ageInDays / MAX_AGE, 1);

    // Adjust weights based on excluded criteria
    const adjustedWeights = getAdjustedWeights(excludedScoreCriteria);

    // Combine weighted metrics
    const weightedStars = Number((normalizedStars * adjustedWeights.stars * 100).toFixed(2));
    const weightedForks = Number((normalizedForks * adjustedWeights.forks * 100).toFixed(2));
    const weightedAge = Number(((1 - normalizedAge) * adjustedWeights.recency * 100).toFixed(2)); // More recent updates should have higher scores

    return {
        stars: { weight: adjustedWeights.stars, value: weightedStars },
        forks: { weight: adjustedWeights.forks, value: weightedForks },
        recency: { weight: adjustedWeights.recency, value: weightedAge },
    };
};

export const getAdjustedWeights = (excludedScoreCriteria: ScoringMetrics[]): Record<ScoringMetrics, number> => {
    // Calculate the total weight of the included metrics
    const includedMetrics = Object.keys(initialWeights).filter(
        (metric) => !excludedScoreCriteria.includes(metric as ScoringMetrics)
    ) as ScoringMetrics[];

    const totalWeight = includedMetrics.reduce((sum, metric) => sum + initialWeights[metric], 0);

    // Adjust the weight of the included metrics
    const adjustedWeights: Record<ScoringMetrics, number> = { stars: 0, forks: 0, recency: 0 };
    includedMetrics.forEach((metric) => {
        adjustedWeights[metric] = Number((initialWeights[metric] / totalWeight).toFixed(2));
    });

    // Ensure excluded metrics have zero weight
    excludedScoreCriteria.forEach((metric) => adjustedWeights[metric] = 0)

    return adjustedWeights;
};
