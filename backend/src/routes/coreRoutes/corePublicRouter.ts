import express, { Router, Request, Response } from 'express';
import path from 'path';
import { isPathInside } from '@/utils/is-path-inside';

const router: Router = express.Router();

router.route('/:subPath/:directory/:file').get(function (req: Request, res: Response) {
  try {
    const { subPath, directory, file } = req.params;

    // Decode each parameter separately
    const decodedSubPath = decodeURIComponent(subPath);
    const decodedDirectory = decodeURIComponent(directory);
    const decodedFile = decodeURIComponent(file);

    // Define the trusted root directory
    const rootDir = path.join(__dirname, '../../public');

    // Safely join the decoded path segments
    const relativePath = path.join(decodedSubPath, decodedDirectory, decodedFile);
    const absolutePath = path.join(rootDir, relativePath);

    // Check if the resulting path stays inside rootDir
    if (!isPathInside(absolutePath, rootDir)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid filepath',
      });
    }

    return res.sendFile(absolutePath, (error) => {
      if (error) {
        res.status(404).json({
          success: false,
          result: null,
          message: 'we could not find : ' + file,
        });
      }
    });
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

