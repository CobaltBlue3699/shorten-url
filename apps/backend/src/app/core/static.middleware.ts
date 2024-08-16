import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { join } from 'path';
import { existsSync } from 'fs';

@Injectable()
export class StaticMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const isAjaxRequest = req.header('X-Requested-With') === 'XMLHttpRequest';
    const filePath = join(__dirname, '..', 'frontend/browser', req.baseUrl);
    if (isAjaxRequest || !existsSync(filePath)) {
      next();
    } else {
      if (req.baseUrl === '') {
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
        res.set('Surrogate-Control', 'no-store');
      } else {
        // TODO: setting this from environment
        res.set('Cache-Control', 'public, max-age=600');
      }
      res.sendFile(filePath);
    }
  }
}
