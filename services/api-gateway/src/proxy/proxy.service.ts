import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios, { AxiosRequestConfig } from 'axios';
import { Response } from 'express';

@Injectable()
export class ProxyService {
  async forward(targetBaseUrl: string, req: any,res:Response) {
    console.log('🔥🔥 PROXY VERSION v3 RUNNING 🔥🔥');

    // MUST exist
    console.log('USER FROM GUARD:', req.user);

    const forwardPath = req.originalUrl
      .replace(/^\/api/, '')
      .replace(/\/$/, '');

    // clone headers
    const headers = { ...req.headers };

    // 🔴 REMOVE ALL PROBLEM HEADERS
    delete headers['content-length'];
    delete headers['Content-Length'];
    delete headers['host'];
    delete headers['connection'];

    // console.log('HEADERS AFTER CLEAN:', headers);

    try {
      const response = await axios({
        method: req.method,
        url: `${targetBaseUrl}${forwardPath}`,
        headers: {
          ...headers,
          'x-user-id': req.user?.userId,
          'x-user-role': req.user?.role,
        },
        data: req.body ?? {},
        params: req.query,
        timeout: 5000,
        withCredentials: true,

      });
       // 🔥 FORWARD SET-COOKIE HEADER
      const setCookie = response.headers["set-cookie"];
      if (setCookie) {
        res.setHeader("set-cookie", setCookie);
      }

      return response.data;
    } catch (error) {
      // 🔥 THIS IS THE MISSING PIECE
      if (axios.isAxiosError(error)) {
        throw new HttpException(
          error.response?.data || { message: 'Upstream service error' },
          error.response?.status || 500
        );
      }

      throw new HttpException('Internal server error', 500);
    }




  }
}
