import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../../application/services/ProductService';
import {
  CreateProductSchema,
  ProductIdSchema,
  UpdateProductSchema,
} from '../../application/dtos/ProductDTO';

export class ProductController {
  constructor(private readonly productService: ProductService) {}

  list = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const products = await this.productService.findAll();
      res.status(200).json(products);
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = ProductIdSchema.parse(req.params);
      const product = await this.productService.findById(id);
      res.status(200).json(product);
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = CreateProductSchema.parse(req.body);
      const product = await this.productService.create(data);
      res.status(201).json(product);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = ProductIdSchema.parse(req.params);
      const data = UpdateProductSchema.parse(req.body);
      const product = await this.productService.update(id, data);
      res.status(200).json(product);
    } catch (err) {
      next(err);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = ProductIdSchema.parse(req.params);
      await this.productService.delete(id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}
