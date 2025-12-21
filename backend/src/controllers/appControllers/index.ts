import createCRUDController from '@/controllers/middlewaresControllers/createCRUDController';
import { routesList } from '@/models/utils';
import { CRUDMethods } from '@/controllers/middlewaresControllers/createCRUDController';

import { globSync } from 'glob';
import * as path from 'path';

const pattern = './src/controllers/appControllers/*/**/';
const controllerDirectories = globSync(pattern).map((filePath) => {
  return path.basename(filePath);
});

const appControllers = () => {
  const controllers: Record<string, CRUDMethods> = {};
  const hasCustomControllers: string[] = [];

  controllerDirectories.forEach((controllerName) => {
    try {
      // Use require for dynamic loading - TypeScript can't statically analyze this
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const customController = require('@/controllers/appControllers/' + controllerName) as CRUDMethods | { default: CRUDMethods };

      if (customController && (customController.default || Object.keys(customController).length > 0)) {
        hasCustomControllers.push(controllerName);
        controllers[controllerName] = (customController.default || customController) as CRUDMethods;
      }
    } catch (err: unknown) {
      // Ignore errors for controllers that don't exist
      // They will be created using the CRUD factory
      if (err instanceof Error) {
        // Silently ignore - controller will be created via CRUD factory
      }
    }
  });

  routesList.forEach(({ modelName, controllerName }) => {
    if (!hasCustomControllers.includes(controllerName)) {
      controllers[controllerName] = createCRUDController(modelName);
    }
  });

  return controllers;
};

export default appControllers();


