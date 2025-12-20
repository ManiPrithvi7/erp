import { Request, Response } from 'express';

declare function downloadPdf(
  req: Request,
  res: Response,
  options: { directory: string; id: string }
): void;

export default downloadPdf;


