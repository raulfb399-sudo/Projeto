export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string | null;
}

export interface CreateCustomerInput {
  name: string;
  email: string;
  phone?: string;
}

export interface UpdateCustomerInput {
  name?: string;
  email?: string;
  phone?: string;
}