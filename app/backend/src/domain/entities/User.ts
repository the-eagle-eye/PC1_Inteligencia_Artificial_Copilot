export class User {
  constructor(
    public readonly id: string,
    public email: string,
    public passwordHash: string,
    public name: string | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  static create(props: {
    id: string;
    email: string;
    passwordHash: string;
    name: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return new User(
      props.id,
      props.email,
      props.passwordHash,
      props.name,
      props.createdAt,
      props.updatedAt,
    );
  }
}
