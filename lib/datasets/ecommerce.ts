import type { Dataset } from "./types";

export const ecommerce: Dataset = {
  id: "ecommerce",
  name: "E-Commerce",
  description:
    "Customers placing orders for products; each order has one or more line items.",
  seed: `
CREATE TABLE customers (
  customer_id INTEGER PRIMARY KEY,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  city        TEXT NOT NULL,
  signup_date TEXT NOT NULL
);

CREATE TABLE products (
  product_id   INTEGER PRIMARY KEY,
  product_name TEXT NOT NULL,
  category     TEXT NOT NULL,
  price        INTEGER NOT NULL,
  stock        INTEGER NOT NULL
);

CREATE TABLE orders (
  order_id     INTEGER PRIMARY KEY,
  customer_id  INTEGER NOT NULL REFERENCES customers(customer_id),
  order_date   TEXT NOT NULL,
  status       TEXT NOT NULL,
  total_amount INTEGER NOT NULL
);

CREATE TABLE order_items (
  order_item_id INTEGER PRIMARY KEY,
  order_id      INTEGER NOT NULL REFERENCES orders(order_id),
  product_id    INTEGER NOT NULL REFERENCES products(product_id),
  quantity      INTEGER NOT NULL,
  price         INTEGER NOT NULL
);

INSERT INTO customers VALUES
  (1,  'Rahul Sharma',   'rahul@example.com',    'Mumbai',    '2023-01-15'),
  (2,  'Aisha Khan',     'aisha@example.com',    'Delhi',     '2023-02-03'),
  (3,  'Vinsmoke Sanji', 'sanji@example.com',    'Bengaluru', '2023-02-20'),
  (4,  'Shashank Rao',   'shashank@example.com', 'Hyderabad', '2023-03-11'),
  (5,  'Aman Verma',     'aman@example.com',     'Delhi',     '2023-04-05'),
  (6,  'Nandini Iyer',   'nandini@example.com',  'Chennai',   '2023-05-22'),
  (7,  'Kabir Malhotra', 'kabir@example.com',    'Mumbai',    '2023-06-30'),
  (8,  'Tanvi Desai',    'tanvi@example.com',    'Pune',      '2023-08-14'),
  (9,  'Harsh Patel',    'harsh@example.com',    'Ahmedabad', '2023-09-09'),
  (10, 'Zara Sheikh',    'zara@example.com',     'Bengaluru', '2023-11-27'),
  (11, 'Dev Mishra',     'dev@example.com',      'Kolkata',   '2024-01-19'),
  (12, 'Lakshmi Nair',   'lakshmi@example.com',  'Chennai',   '2024-03-02');

INSERT INTO products VALUES
  (1,  'Wireless Mouse',              'Electronics', 1299, 150),
  (2,  'Mechanical Keyboard',         'Electronics', 4499, 60),
  (3,  'USB-C Hub',                   'Electronics', 2199, 0),
  (4,  'Running Shoes',               'Footwear',    3999, 80),
  (5,  'Cotton T-Shirt',              'Clothing',    699,  300),
  (6,  'Denim Jeans',                 'Clothing',    1999, 120),
  (7,  'Yoga Mat',                    'Sports',      1499, 45),
  (8,  'Water Bottle',                'Sports',      499,  200),
  (9,  'Coffee Maker',                'Home',        5999, 25),
  (10, 'Desk Lamp',                   'Home',        1899, 70),
  (11, 'Noise Cancelling Headphones', 'Electronics', 8999, 35),
  (12, 'Backpack',                    'Accessories', 2499, 0);

INSERT INTO orders VALUES
  (1,  1,  '2024-01-05', 'delivered', 2697),
  (2,  2,  '2024-01-12', 'delivered', 4499),
  (3,  3,  '2024-01-20', 'delivered', 10298),
  (4,  4,  '2024-02-02', 'cancelled', 5999),
  (5,  1,  '2024-02-14', 'delivered', 4997),
  (6,  5,  '2024-02-25', 'shipped',   3998),
  (7,  6,  '2024-03-03', 'delivered', 1998),
  (8,  3,  '2024-03-15', 'delivered', 6698),
  (9,  7,  '2024-03-28', 'delivered', 2097),
  (10, 2,  '2024-04-10', 'pending',   8999),
  (11, 8,  '2024-04-18', 'delivered', 6498),
  (12, 3,  '2024-05-02', 'delivered', 3999),
  (13, 5,  '2024-05-20', 'delivered', 2598),
  (14, 10, '2024-06-07', 'delivered', 2698),
  (15, 6,  '2024-06-21', 'cancelled', 4499),
  (16, 7,  '2024-07-04', 'delivered', 11198),
  (17, 1,  '2024-07-19', 'shipped',   1499),
  (18, 10, '2024-08-08', 'delivered', 5999),
  (19, 4,  '2024-08-25', 'delivered', 1996),
  (20, 11, '2024-09-10', 'pending',   3397);

INSERT INTO order_items VALUES
  (1,  1,  1,  1, 1299), (2,  1,  5,  2, 699),
  (3,  2,  2,  1, 4499),
  (4,  3,  11, 1, 8999), (5,  3,  1,  1, 1299),
  (6,  4,  9,  1, 5999),
  (7,  5,  4,  1, 3999), (8,  5,  8,  2, 499),
  (9,  6,  6,  2, 1999),
  (10, 7,  7,  1, 1499), (11, 7,  8,  1, 499),
  (12, 8,  2,  1, 4499), (13, 8,  3,  1, 2199),
  (14, 9,  5,  3, 699),
  (15, 10, 11, 1, 8999),
  (16, 11, 9,  1, 5999), (17, 11, 8,  1, 499),
  (18, 12, 4,  1, 3999),
  (19, 13, 1,  2, 1299),
  (20, 14, 6,  1, 1999), (21, 14, 5,  1, 699),
  (22, 15, 2,  1, 4499),
  (23, 16, 11, 1, 8999), (24, 16, 3,  1, 2199),
  (25, 17, 7,  1, 1499),
  (26, 18, 9,  1, 5999),
  (27, 19, 8,  4, 499),
  (28, 20, 5,  2, 699),  (29, 20, 6,  1, 1999);
`,
};
