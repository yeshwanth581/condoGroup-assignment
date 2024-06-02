import { Request } from "express";

export const extractReqParams = (req: Request) => {
    const queryParamsFromReq = req.query
    const pathParamsFromReq = req.params

    const queryParams: Record<string, string> = {}
    const pathParams: Record<string, string> = {}

    for (const param in queryParamsFromReq) {
        queryParams[param] = queryParamsFromReq[param]?.toString() || ''
    }

    for (const param in pathParamsFromReq) {
        pathParams[param] = pathParamsFromReq[param]?.toString() || ''
    }

    return { queryParams, pathParams }
}