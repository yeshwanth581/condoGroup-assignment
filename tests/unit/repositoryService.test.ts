import axios from 'axios';
import { fetchAllRepositories, fetchRepositoryInfo } from '../../src/services/repositoryService';
import { getAndClearCache, setCache, setCacheForMultipleItems } from '../../src/providers';
import { API_BASE_URL, FETCH_ALL_REPOS_LIST_ENDPOINT, FETCH_REPO_INFO } from '../../src/constants/contants';
import { ScoringMetrics } from '../../src/types/repository';

// Mock dependencies
jest.mock('axios');
jest.mock('../../src/providers', () => ({
    getAndClearCache: jest.fn(),
    setCache: jest.fn(),
    setCacheForMultipleItems: jest.fn(),
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('RepositoryService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('fetchAllRepositories', () => {
        it('should fetch and transform repositories correctly', async () => {
            const mockResponse = {
                items: [
                    {
                        id: 1,
                        git_url: 'git_url_1',
                        full_name: 'repo1',
                        description: 'desc1',
                        created_at: '2021-01-01T00:00:00Z',
                        updated_at: '2022-01-01T00:00:00Z',
                        language: 'JavaScript',
                        stargazers_count: 100000,
                        forks_count: 50000,
                        not_needed_key: 'dummy'
                    },
                ],
            };

            const queryParams = {
                language: 'JavaScript',
                created: '2021-01-01',
                displayParams: { page: 1, per_page: 10, sort: 'stars', order: 'desc' as 'desc' | 'asc' },
                excludedMetrics: ['recency'] as ScoringMetrics[],
            };

            const requestUrl = `${API_BASE_URL}/${FETCH_ALL_REPOS_LIST_ENDPOINT}?q=language:JavaScript+created:>=2021-01-01&page=1&per_page=10&sort=stars&order=desc`;

            mockedAxios.get.mockResolvedValue({ data: mockResponse });

            const result = await fetchAllRepositories(
                queryParams.language,
                queryParams.created,
                queryParams.displayParams,
                queryParams.excludedMetrics
            );

            expect(result).toHaveLength(1);
            expect(result[0]).not.toHaveProperty('not_needed_key')
            expect(result[0]).toHaveProperty('score');
            expect(result[0].score).toEqual(23.15);
            expect(result[0]).toHaveProperty('breakdown');
            expect(setCacheForMultipleItems).toHaveBeenCalledWith(expect.any(Array));
            expect(mockedAxios.get).toHaveBeenCalledWith(decodeURIComponent(requestUrl));
        });

        it('should handle errors while fetching repositories', async () => {
            const queryParams = {
                language: 'JavaScript',
                created: '2021-01-01',
                displayParams: { page: 1, per_page: 10, sort: 'stars', order: 'desc' as 'desc' | 'asc' },
                excludedMetrics: [],
            };

            const requestUrl = `${API_BASE_URL}/${FETCH_ALL_REPOS_LIST_ENDPOINT}?q=language:JavaScript+created:>=2021-01-01&page=1&per_page=10&sort=stars&order=desc`;

            mockedAxios.get.mockRejectedValue(new Error('Network Error'));

            await expect(fetchAllRepositories(
                queryParams.language,
                queryParams.created,
                queryParams.displayParams,
                queryParams.excludedMetrics
            )).rejects.toThrow('Network Error');
            expect(mockedAxios.get).toHaveBeenCalledWith(decodeURIComponent(requestUrl));
        });
    });

    describe('fetchRepositoryInfo', () => {
        it('should fetch and transform a single repository correctly', async () => {
            const mockResponse = {
                id: 1,
                git_url: 'git_url_1',
                full_name: 'repo1',
                description: 'desc1',
                created_at: '2021-01-01T00:00:00Z',
                updated_at: '2022-01-01T00:00:00Z',
                language: 'JavaScript',
                stargazers_count: 100,
                forks_count: 50,
            };

            const requestUrl = `${API_BASE_URL}/${FETCH_REPO_INFO}/owner/repo`;

            mockedAxios.get.mockResolvedValue({ data: mockResponse });
            (getAndClearCache as jest.Mock).mockResolvedValue(null);

            const result = await fetchRepositoryInfo('owner', 'repo', []);

            expect(result).toHaveProperty('git_url', 'git_url_1');
            expect(result).toHaveProperty('score');
            expect(result).toHaveProperty('oldScore', null);
            expect(result).toHaveProperty('diffPercentage', null);
            expect(setCache).toHaveBeenCalledWith('git_url_1', expect.any(Object));
            expect(mockedAxios.get).toHaveBeenCalledWith(requestUrl);
        });

        it('should fetch repository info and compare with cached data', async () => {
            const mockResponse = {
                id: 1,
                git_url: 'git_url_1',
                full_name: 'repo1',
                description: 'desc1',
                created_at: '2021-01-01T00:00:00Z',
                updated_at: '2022-01-01T00:00:00Z',
                language: 'JavaScript',
                stargazers_count: 10000,
                forks_count: 50000,
            };

            const mockCachedResponse = {
                ...mockResponse,
                stargazers_count: 200000,
                forks_count: 100000,
                score: 0.02,
            };

            const requestUrl = `${API_BASE_URL}/${FETCH_REPO_INFO}/owner/repo`;

            mockedAxios.get.mockResolvedValue({ data: mockResponse });
            (getAndClearCache as jest.Mock).mockResolvedValue(mockCachedResponse);

            const result = await fetchRepositoryInfo('owner', 'repo', ['recency']);

            expect(result).toHaveProperty('git_url', 'git_url_1');
            expect(result).toHaveProperty('oldScore', 46.3);
            expect(result).toHaveProperty('diffPercentage', -81);
            expect(setCache).toHaveBeenCalledWith('git_url_1', expect.any(Object));
            expect(mockedAxios.get).toHaveBeenCalledWith(requestUrl);
        });

        it('should handle errors while fetching repository info', async () => {
            const requestUrl = `${API_BASE_URL}/${FETCH_REPO_INFO}/owner/repo`;

            mockedAxios.get.mockRejectedValue(new Error('Network Error'));

            await expect(fetchRepositoryInfo('owner', 'repo', [])).rejects.toThrow('Network Error');
            expect(mockedAxios.get).toHaveBeenCalledWith(requestUrl);
        });
    });
});
