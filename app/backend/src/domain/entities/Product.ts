export class Product {
  constructor(
    public readonly id: string,
    public name: string,
    public description: string | null,
    public price: number,
    public stock: number,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  static create(props: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    stock: number;
    createdAt: Date;
    updatedAt: Date;
  }): Product {
    return new Product(
      props.id,
      props.name,
      props.description,
      props.price,
      props.stock,
      props.createdAt,
      props.updatedAt,
    );
  }
}
