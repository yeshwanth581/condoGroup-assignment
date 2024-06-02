import { ScoringMetrics } from '../../src/types/repository';
import { getAdjustedWeights, getIndividualScore } from '../../src/utils/scoringEngine';


describe('getIndividualScore', () => {
    const repoData = {
        stars: 200000,
        forks: 100000,
        lastUpdated: new Date(new Date().setFullYear(new Date().getFullYear() - 1)), // 1 year ago
    };

    it('should calculate scores correctly(100%) without excluded criteria with perfect values', () => {
        const excludedCriteria: ScoringMetrics[] = [];
        const scores = getIndividualScore({
            stars: 400000,
            forks: 250000,
            lastUpdated: new Date()
        }, excludedCriteria);

        expect(scores.stars.value).toBeCloseTo(50);
        expect(scores.forks.value).toBeCloseTo(30);
        expect(scores.recency.value).toBeCloseTo(20);
    });

    it('should calculate scores correctly without excluded criteria', () => {
        const excludedCriteria: ScoringMetrics[] = [];
        const scores = getIndividualScore(repoData, excludedCriteria);

        expect(scores.stars.value).toBeCloseTo(25);
        expect(scores.forks.value).toBeCloseTo(12);
        expect(scores.recency.value).toBeCloseTo(9.97);
    });

    it('should adjust scores when stars are excluded', () => {
        const excludedCriteria: ScoringMetrics[] = ['stars'];
        const scores = getIndividualScore(repoData, excludedCriteria);

        expect(scores.stars.value).toBe(0);
        expect(scores.stars.weight).toBe(0);
        expect(scores.forks.value).toBeCloseTo(24);
        expect(scores.forks.weight).toBeCloseTo(0.6);
        expect(scores.recency.value).toBeCloseTo(19.95);
        expect(scores.recency.weight).toBeCloseTo(0.4);
    });

    it('should adjust scores when forks are excluded', () => {
        const excludedCriteria: ScoringMetrics[] = ['forks'];
        const scores = getIndividualScore(repoData, excludedCriteria);

        expect(scores.forks.value).toBe(0);
        expect(scores.forks.weight).toBe(0);
        expect(scores.stars.value).toBeCloseTo(35.5);
        expect(scores.stars.weight).toBeCloseTo(0.71);
        expect(scores.recency.value).toBeCloseTo(14.46);
        expect(scores.recency.weight).toBeCloseTo(0.29);
    });

    it('should adjust scores when recency is excluded', () => {
        const excludedCriteria: ScoringMetrics[] = ['recency'];
        const scores = getIndividualScore(repoData, excludedCriteria);

        expect(scores.recency.value).toBe(0);
        expect(scores.recency.weight).toBe(0);
        expect(scores.stars.value).toBeCloseTo(31.5);
        expect(scores.stars.weight).toBeCloseTo(0.63);
        expect(scores.forks.value).toBeCloseTo(14.8);
        expect(scores.forks.weight).toBeCloseTo(0.37);
    });


    it('should adjust scores when multiple criteria are excluded', () => {
        const excludedCriteria: ScoringMetrics[] = ['stars', 'forks'];
        const scores = getIndividualScore(repoData, excludedCriteria);

        expect(scores.stars.value).toBe(0);
        expect(scores.forks.value).toBe(0);
        expect(scores.recency.value).toBeCloseTo(49.86);
        expect(scores.recency.weight).toEqual(1)
    });

    it('should handle empty input gracefully', () => {
        const emptyRepoData = {
            stars: 0,
            forks: 0,
            lastUpdated: new Date(),
        };
        const excludedCriteria: ScoringMetrics[] = [];
        const scores = getIndividualScore(emptyRepoData, excludedCriteria);

        expect(scores.stars.value).toBe(0);
        expect(scores.forks.value).toBe(0);
        expect(scores.recency.value).toBeCloseTo(20);
    });
});

describe('getAdjustedWeights', () => {
    it('should return initial weights when no criteria are excluded', () => {
        const excludedCriteria: ScoringMetrics[] = [];
        const adjustedWeights = getAdjustedWeights(excludedCriteria);

        expect(adjustedWeights.stars).toBeCloseTo(0.5);
        expect(adjustedWeights.forks).toBeCloseTo(0.3);
        expect(adjustedWeights.recency).toBeCloseTo(0.2);
    });

    it('should adjust weights when stars are excluded', () => {
        const excludedCriteria: ScoringMetrics[] = ['stars'];
        const adjustedWeights = getAdjustedWeights(excludedCriteria);

        expect(adjustedWeights.stars).toBe(0);
        expect(adjustedWeights.forks).toBeCloseTo(0.6);
        expect(adjustedWeights.recency).toBeCloseTo(0.4);
    });

    it('should adjust weights when forks are excluded', () => {
        const excludedCriteria: ScoringMetrics[] = ['forks'];
        const adjustedWeights = getAdjustedWeights(excludedCriteria);

        expect(adjustedWeights.forks).toBe(0);
        expect(adjustedWeights.stars).toBeCloseTo(0.71);
        expect(adjustedWeights.recency).toBeCloseTo(0.29);
    });

    it('should adjust weights when recency is excluded', () => {
        const excludedCriteria: ScoringMetrics[] = ['recency'];
        const adjustedWeights = getAdjustedWeights(excludedCriteria);

        expect(adjustedWeights.recency).toBe(0);
        expect(adjustedWeights.stars).toBeCloseTo(0.63);
        expect(adjustedWeights.forks).toBeCloseTo(0.37);
    });

    it('should handle multiple excluded criteria', () => {
        const excludedCriteria: ScoringMetrics[] = ['stars', 'forks'];
        const adjustedWeights = getAdjustedWeights(excludedCriteria);

        expect(adjustedWeights.stars).toBe(0);
        expect(adjustedWeights.forks).toBe(0);
        expect(adjustedWeights.recency).toBeCloseTo(1);
    });

    it('should handle all criteria excluded', () => {
        const excludedCriteria: ScoringMetrics[] = ['stars', 'forks', 'recency'];
        const adjustedWeights = getAdjustedWeights(excludedCriteria);

        expect(adjustedWeights.stars).toBe(0);
        expect(adjustedWeights.forks).toBe(0);
        expect(adjustedWeights.recency).toBe(0);
    });
});
