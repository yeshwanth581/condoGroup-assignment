import { NextFunction, Request, Response } from 'express';
import { fetchAllRepositories, fetchRepositoryInfo } from '../services/repositoryService';
import { RepositoryItem, ScoringMetrics } from '../types/repository';
import { extractReqParams } from '../utils/reqParamsExtractor';

export const getAllRepos = async (req: Request, res: Response, next: NextFunction) => {
  const { queryParams } = extractReqParams(req)
  const { language, created, limit, page, order, sortBy, excludedScoreCriteria } = queryParams;

  try {
    const displayParams = {
      per_page: parseInt(limit, 10),
      page: parseInt(page, 10),
      order: order as 'asc' | 'desc',
      sort: sortBy,
    }

    const repositories: RepositoryItem[] = await fetchAllRepositories(language, created, displayParams, excludedScoreCriteria?.split(',') as ScoringMetrics[] || []);
    res.status(200).json(repositories);
  } catch (error) {
    res.status(500).send('Error fetching repositories')
    next(error);
  }
};

export const getRepoInfo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pathParams, queryParams } = extractReqParams(req)
    const { username, repositoryName } = pathParams
    const { excludedScoreCriteria } = queryParams;

    const repositoryInfo: RepositoryItem = await fetchRepositoryInfo(username, repositoryName, excludedScoreCriteria?.split(',') as ScoringMetrics[] || [])
    res.status(200).send(repositoryInfo)
  } catch (error) {
    res.status(500).send('Error fetching repository data')
    next(error);
  }
}

