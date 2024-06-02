import NodeCache from 'node-cache';
import { RepositoryItem } from '../types/repository';
const ONE_HOUR_TTL = 60 * 60 // 1hr
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 120 });

export const setCache = (key: string, value: any) => cache.set(key, value, ONE_HOUR_TTL);

export const setCacheForMultipleItems = (data: any[]) => cache.mset(data)

export const getCache = (key: string) => cache.get(key)

export const getAndClearCache = (key: string): (RepositoryItem | undefined) => cache.take(key)

export const deleteCache = (key: string) => cache.del(key);

export const getCacheKeys = () => cache.keys()

export const hasKeyInCache = (key: string) => cache.has(key)

export const closeCacheDB = () => cache.close()

export const getAllKeysInCache = () => cache.keys()