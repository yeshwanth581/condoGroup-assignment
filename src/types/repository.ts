export type ScoringMetrics = 'stars' | 'forks' | 'recency'

export interface RepositoryResponse {
    total_count: number
    incomplete_results: boolean
    items: RepositoryItem[]
}

export interface RepositoryItem {
    id: number
    full_name: string
    description: string
    created_at: string
    updated_at: string
    git_url: string
    language: string
    stargazers_count: number
    forks_count: number
    score: number
    breakdown?: Record<ScoringMetrics, { weight: number; value: number }>
    oldScore?: number | null
    diffPercentage?: number | null
}
