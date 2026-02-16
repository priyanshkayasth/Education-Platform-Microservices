import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios, { AxiosRequestConfig } from 'axios';
import { Response } from 'express';

@Injectable()
export class ProxyService {
  async forward(targetBaseUrl: string, req: any,res:Response) {
    console.log('🔥🔥 PROXY VERSION v3 RUNNING 🔥🔥');
     console.log("x-user-id:", req.user?.userId);
console.log("x-user-role:", req.user?.role);


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
    headers['cookie'] = req.headers.cookie || "";


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
        maxRedirects: 0, 
        validateStatus: () => true, 
        // validateStatus: (status) => status >= 200 && status < 300,
        

      });
     if (response.status === 302 || response.status === 301) {
  const location = response.headers['location'];

  if (location) {
    return res.redirect(location);
  }
}
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
