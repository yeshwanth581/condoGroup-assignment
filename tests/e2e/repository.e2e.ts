import request from 'supertest';
import app from '../../src/app';

describe('/api/v1/getAllRepos', () => {
    it('valid url', async () => {
        const res = await request(app).get('/api/v1/getAllRepos?language=javascript&created=2020-01-01&limit=10');
        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toEqual(10);
        expect(res.body[0].language).toBe('JavaScript')
        expect(new Date(res.body[0].created_at).getTime()).toBeGreaterThanOrEqual(new Date('2020-01-01').getTime())
    });

    it('with missing language query in "q" queryparam', async () => {
        const res = await request(app).get('/api/v1/getAllRepos?created=2020-01-01&limit=10');
        expect(res.statusCode).toEqual(400);
        expect(res.body).toEqual({
            statusCode: 400,
            name: 'INVALID_REQUEST',
            message: `"language" is required`
        })
    });

    it('with missing createdAt query in "q" queryparam', async () => {
        const res = await request(app).get('/api/v1/getAllRepos?language=java&limit=10');
        expect(res.statusCode).toEqual(400);
        expect(res.body).toEqual({
            statusCode: 400,
            name: 'INVALID_REQUEST',
            message: `"created" is required`
        })
    });

    it('with excludedScoreCriteria param', async () => {
        const res = await request(app).get('/api/v1/getAllRepos?language=java&created=2020-01-01&limit=10');
        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toEqual(10);
        expect(res.body[0].language).toBe('Java')
        expect(new Date(res.body[0].created_at).getTime()).toBeGreaterThanOrEqual(new Date('2020-01-01').getTime())
    });


    it('with invalid excludedScoreCriteria param', async () => {
        const res = await request(app).get('/api/v1/getAllRepos?language=python&created=2020-01-01&limit=5&excludedScoreCriteria=recency');
        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toEqual(5);
        expect(res.body[0].language).toBe('Python')
        expect(JSON.stringify(res.body[0].breakdown.recency)).toEqual("{\"weight\":0,\"value\":0}")
    });


    it('with invalid excludedScoreCriteria params count', async () => {
        const res = await request(app).get('/api/v1/getAllRepos?language=java&created=2020-01-01&limit=10&excludedScoreCriteria=forks,stars,recency');
        expect(res.statusCode).toEqual(400);
        expect(JSON.stringify(res.body)).toContain('At most two values are allowed')
    });

});

describe('/api/v1/:owner/:repository/getRepoInfo', () => {
    it('valid url', async () => {
        const res = await request(app).get('/api/v1/jtleek/datasharing/getRepoInfo');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('score');
        expect(res.body).toHaveProperty('oldScore');
        expect(JSON.stringify(res.body.oldScore)).toEqual("null")
        expect(res.body).toHaveProperty('diffPercentage');
    });

    it('accept excludedScoreCriteria param with valid url', async () => {
        const res = await request(app).get('/api/v1/jtleek/datasharing/getRepoInfo?excludedScoreCriteria=recency');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('score');
        expect(res.body).toHaveProperty('oldScore');
        expect(res.body).toHaveProperty('diffPercentage');
        expect(JSON.stringify(res.body.breakdown.recency)).toEqual("{\"weight\":0,\"value\":0}")
        expect(JSON.stringify(res.body.oldScore)).not.toEqual(null)
    });

    it('with missing owner parm in path param', async () => {
        const res = await request(app).get('/api/v1/geekxh/getRepoInfo');
        expect(res.statusCode).toEqual(404);
        expect(res.body).toEqual({
            statusCode: 404,
            name: 'NOT_FOUND',
            message: `Resource not found`
        })
    });

});