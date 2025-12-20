import downloadPdf from '@/handlers/downloadHandler/downloadPdf';
import express, { Router, Request, Response } from 'express';

const router: Router = express.Router();

router.route('/:directory/:file').get(function (req: Request, res: Response) {
  try {
    const { directory, file } = req.params;
    const id = file.slice(directory.length + 1).slice(0, -4); // extract id from file name
    downloadPdf(req, res, { directory, id });
    return;
  } catch (error: any) {
    return res.status(503).json({
      success: false,
      result: null,
      message: error.message,
      error: error,
    });
  }
});

export default router;

