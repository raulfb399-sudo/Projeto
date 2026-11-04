

import sqlite3 from 'sqlite3';

export const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err.message);
  } else {
    console.log('Conectado ao banco SQLite com sucesso!');
  }
});

import {
  Product,
  CreateProductInput,
  UpdateProductInput,
} from '../models/product.model';

interface SqliteRunContext {
  lastID: number;
  changes: number;
}

export const productRepository = {
  findAll(): Promise<Product[]> {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM products ORDER BY id',
        (err: Error | null, rows: Product[]) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        },
      );
    });
  },

  findById(id: number): Promise<Product | null> {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM products WHERE id = ?',
        [id],
        (err: Error | null, row: Product | undefined) => {
          if (err) {
            reject(err);
          } else {
            resolve(row ?? null);
          }
        },
      );
    });
  },

  create(input: CreateProductInput): Promise<Product> {
    return new Promise((resolve, reject) => {
      const { name, description, price } = input;

      db.run(
        'INSERT INTO products (name, description, price) VALUES (?, ?, ?)',
        [name, description ?? null, price],
        function (
          this: SqliteRunContext,
          err: Error | null,
        ) {
          if (err) {
            reject(err);
            return;
          }

          productRepository
            .findById(this.lastID)
            .then((product) => {
              if (!product) {
                reject(new Error('Produto criado, mas não encontrado'));
                return;
              }

              resolve(product);
            })
            .catch(reject);
        },
      );
    });
  },

  update(id: number, input: UpdateProductInput): Promise<Product | null> {
    return new Promise((resolve, reject) => {
      const fields: string[] = [];
      const values: unknown[] = [];

      if (input.name !== undefined) {
        fields.push('name = ?');
        values.push(input.name);
      }

      if (input.description !== undefined) {
        fields.push('description = ?');
        values.push(input.description);
      }

      if (input.price !== undefined) {
        fields.push('price = ?');
        values.push(input.price);
      }

      if (fields.length === 0) {
        productRepository
          .findById(id)
          .then(resolve)
          .catch(reject);
        return;
      }

      values.push(id);

      db.run(
        `UPDATE products SET ${fields.join(', ')} WHERE id = ?`,
        values,
        (err: Error | null) => {
          if (err) {
            reject(err);
            return;
          }

          productRepository
            .findById(id)
            .then(resolve)
            .catch(reject);
        },
      );
    });
  },

  delete(id: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM products WHERE id = ?',
        [id],
        function (
          this: SqliteRunContext,
          err: Error | null,
        ) {
          if (err) {
            reject(err);
          } else {
            resolve(this.changes > 0);
          }
        },
      );
    });
  },

  existsInOrder(id: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT 1 FROM order_items WHERE product_id = ? LIMIT 1',
        [id],
        (err: Error | null, row: unknown) => {
          if (err) {
            reject(err);
          } else {
            resolve(row !== undefined);
          }
        },
      );
    });
  },
};
