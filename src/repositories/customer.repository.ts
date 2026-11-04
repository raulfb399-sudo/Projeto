
import { db } from "../config/database";
import {
  Customer,
  CreateCustomerInput,
  UpdateCustomerInput
} from "../models/customer.model";
import sqlite3 from "sqlite3";

export const customerRepository = {
  findAll(): Promise<Customer[]> {
    return new Promise((resolve, reject) => {
      db.all(
        "SELECT * FROM customers ORDER BY id",
        (err: Error | null, rows: Customer[]) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  },

  findById(id: number): Promise<Customer | null> {
    return new Promise((resolve, reject) => {
      db.get(
        "SELECT * FROM customers WHERE id = ?",
        [id],
        (err: Error | null, row: Customer | undefined) => {
          if (err) reject(err);
          else resolve(row ?? null);
        }
      );
    });
  },

  findByEmail(email: string): Promise<Customer | null> {
    return new Promise((resolve, reject) => {
      db.get(
        "SELECT * FROM customers WHERE email = ?",
        [email],
        (err: Error | null, row: Customer | undefined) => {
          if (err) reject(err);
          else resolve(row ?? null);
        }
      );
    });
  },

  create(input: CreateCustomerInput): Promise<Customer> {
    return new Promise((resolve, reject) => {
      const { name, email, phone } = input;

      db.run(
        "INSERT INTO customers (name, email, phone) VALUES (?, ?, ?)",
        [name, email, phone ?? null],
        function (this: sqlite3.RunResult, err: Error | null) {
          if (err) return reject(err);

          customerRepository.findById(this.lastID)
            .then((customer) => {
              if (customer) resolve(customer);
              else reject(new Error("Cliente criado, mas não encontrado"));
            })
            .catch(reject);
        }
      );
    });
  },

  update(id: number, input: UpdateCustomerInput): Promise<Customer | null> {
    return new Promise((resolve, reject) => {
      const fields: string[] = [];
      const values: (string | number | null)[] = [];

      if (input.name !== undefined) {
        fields.push("name = ?");
        values.push(input.name);
      }

      if (input.email !== undefined) {
        fields.push("email = ?");
        values.push(input.email);
      }

      if (input.phone !== undefined) {
        fields.push("phone = ?");
        values.push(input.phone);
      }

      if (fields.length === 0) {
        return customerRepository.findById(id).then(resolve).catch(reject);
      }

      values.push(id);

      db.run(
        `UPDATE customers SET ${fields.join(", ")} WHERE id = ?`,
        values,
        (err: Error | null) => {
          if (err) return reject(err);

          customerRepository.findById(id).then(resolve).catch(reject);
        }
      );
    });
  },

  delete(id: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      db.run(
        "DELETE FROM customers WHERE id = ?",
        [id],
        function (this: sqlite3.RunResult, err: Error | null) {
          if (err) reject(err);
          else resolve(this.changes > 0);
        }
      );
    });
  },

  existsInOrder(id: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      db.get(
        "SELECT 1 FROM orders WHERE customer_id = ? LIMIT 1",
        [id],
        (err: Error | null, row: unknown) => {
          if (err) reject(err);
          else resolve(!!row);
        }
      );
    });
  }
};
