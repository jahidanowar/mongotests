import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import http from "http";

interface User {
  name: string;
  email: string;
  age: number;
  password: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  avatar: string;
  isAdmin: boolean;
}

interface Product {
  name: string;
  price: number;
  description: string;
  image: string;
  quantity: number;
  category: string;
  isFeatured: boolean;
}

class Seed {
  connection: mongoose.Connection;
  collection: string;
  limit: number;
  data: any;

  constructor(
    connection: mongoose.Connection,
    collection: string,
    limit: number
  ) {
    this.connection = connection;
    this.collection = collection;
    this.limit = limit;
  }
  createUsers(): Seed {
    const users: User[] = [];
    for (let i = 0; i < this.limit; i++) {
      const user: User = {
        name: faker.name.findName(),
        email: faker.internet.email(),
        age: faker.datatype.number({ min: 18, max: 60 }),
        password: faker.internet.password(),
        address: faker.address.streetAddress(),
        city: faker.address.city(),
        state: faker.address.state(),
        zip: faker.address.zipCode(),
        phone: faker.phone.phoneNumber(),
        avatar: faker.image.avatar(),
        isAdmin: faker.datatype.boolean(),
      };
      users.push(user);
    }
    console.log(`Array of ${this.limit} Users constructed`)
    this.data = users;
    return this;
  }
  createProducts(): Seed {
    const products: Product[] = [];
    for (let i = 0; i < this.limit; i++) {
      const product: Product = {
        name: faker.commerce.productName(),
        price: parseFloat(faker.commerce.price()),
        description: faker.lorem.paragraph(),
        image: faker.image.image(480, 480),
        quantity: faker.datatype.number({ min: 1, max: 100 }),
        category: faker.commerce.department(),
        isFeatured: faker.datatype.boolean(),
      };
      products.push(product);
    }
    console.log(`Array of ${this.limit} Products constructed`)
    this.data = products;
    return this;
  }
  async run(): Promise<any> {
    try {
      await this.connection.db
        .collection(this.collection)
        .insertMany(this.data);
      console.log(
        `${this.data?.length} Records Seeded into ${this.collection}`
      );
      Promise.resolve(this.data);
    } catch (e) {
      Promise.reject(e);
    }
  }
}

(async () => {
  try {
   await mongoose.connect("mongodb://127.0.0.1:27017/ecommerce");
  
  //  await new Seed(mongoose.connection, "users", 1000000).createUsers().run();
  //  await new Seed(mongoose.connection, "products", 1000000).createUsers().run();

  } catch (err) {
    console.log(err);
    process.exit(1);
  }
})();

http
  .createServer(async (req, res) => {
    const connection: mongoose.Connection = mongoose.connection;
    const products: any = await connection.db
      .collection("products")
      .find({})
      .limit(1000)
      .toArray();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.write(JSON.stringify(products));
    res.end();
  })
  .listen(3000);
