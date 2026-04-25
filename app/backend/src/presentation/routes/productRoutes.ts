import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';

export function buildProductRouter(controller: ProductController): Router {
  const router = Router();
  router.get('/', controller.list);
  router.get('/:id', controller.getById);
  router.post('/', controller.create);
  router.put('/:id', controller.update);
  router.delete('/:id', controller.remove);
  return router;
}
