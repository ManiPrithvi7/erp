import express, { Router, Request, Response, NextFunction } from 'express';
import { catchErrors } from '@/handlers/errorHandlers';
import appControllers from '@/controllers/appControllers';
import { routesList } from '@/models/utils';
import { CRUDMethods } from '@/controllers/middlewaresControllers/createCRUDController';

const router: Router = express.Router();

const routerApp = (entity: string, controller: CRUDMethods) => {
  router.route(`/${entity}/create`).post(catchErrors(controller['create']));
  router.route(`/${entity}/read/:id`).get(catchErrors(controller['read']));
  router.route(`/${entity}/update/:id`).patch(catchErrors(controller['update']));
  router.route(`/${entity}/delete/:id`).delete(catchErrors(controller['delete']));
  router.route(`/${entity}/search`).get(catchErrors(controller['search']));
  router.route(`/${entity}/list`).get(catchErrors(controller['list']));
  router.route(`/${entity}/listAll`).get(catchErrors(controller['listAll']));
  router.route(`/${entity}/filter`).get(catchErrors(controller['filter']));
  router.route(`/${entity}/summary`).get(catchErrors(controller['summary']));

  if (entity === 'invoice' || entity === 'quote' || entity === 'payment') {
    const mailMethod = controller['mail'];
    if (mailMethod && typeof mailMethod === 'function') {
      router.route(`/${entity}/mail`).post(catchErrors(mailMethod as (req: Request, res: Response, next: NextFunction) => Promise<unknown>));
    }
  }

  if (entity === 'quote') {
    const convertMethod = controller['convert'];
    if (convertMethod && typeof convertMethod === 'function') {
      router.route(`/${entity}/convert/:id`).get(catchErrors(convertMethod as (req: Request, res: Response, next: NextFunction) => Promise<unknown>));
    }
  }
};

routesList.forEach(({ entity, controllerName }: { entity: string; controllerName: string }) => {
  const controller = appControllers[controllerName];
  if (controller) {
    routerApp(entity, controller);
  }
});

export default router;


