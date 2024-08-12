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
      res.sendFile(filePath);
    }
  }
}
