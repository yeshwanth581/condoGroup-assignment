import { Router } from 'express';
import { getAllRepos, getRepoInfo } from '../controllers';
import { fetchAllReposParamsValidator, fetchRepoInfoParamsValidator } from '../validators';

const router = Router();

router.get('/getAllRepos', fetchAllReposParamsValidator, getAllRepos);
router.get('/:username/:repositoryName/getRepoInfo', fetchRepoInfoParamsValidator, getRepoInfo)

export default router;
