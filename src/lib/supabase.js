import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Profiles service — store extra user info such as username and role
export const profilesService = {
  async createProfile({ id, username, email, role = 'admin' }) {
    const { data, error } = await supabase
      .from('profiles')
      .insert([{ id, username, email, role }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getByUserId(id) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async getByEmail(email) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();
    if (error) throw error;
    return data;
  },

  async getByUsername(username) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username.toLowerCase())
      .single();
    if (error) throw error;
    return data;
  },
};

// Authentication functions
export const authService = {
  // Sign up
  async signup(email, password) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  // Sign in
  async signin(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  // Sign out
  async signout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  // Get session
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  // Reset password
  async resetPassword(email) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
    return data;
  },

  // Update password
  async updatePassword(newPassword) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
    return data;
  },
};

// Products service
export const productsService = {
  // Get all products
  async getAll() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      throw error;
    }
    return data || [];
  },

  // Get single product
  async getById(id) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      throw error;
    }
    return data;
  },

  // Get products by category
  async getByCategory(category) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false });
    if (error) {
      throw error;
    }
    return data || [];
  },

  // Create product
  async create(product) {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select();
    if (error) {
      throw error;
    }
    return data[0];
  },

  // Update product
  async update(id, updates) {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select();
    if (error) {
      throw error;
    }
    return data[0];
  },

  // Delete product
  async delete(id) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    if (error) {
      throw error;
    }
  },

  // Search products
  async search(query) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`);
    if (error) {
      throw error;
    }
    return data || [];
  },
};

// Inquiries service
export const inquiriesService = {
  // Get all inquiries
  async getAll() {
    const { data, error } = await supabase
      .from('inquiries')
      .select('*, products(name)')
      .order('created_at', { ascending: false });
    if (error) {
      throw error;
    }
    return data || [];
  },

  // Get single inquiry
  async getById(id) {
    const { data, error } = await supabase
      .from('inquiries')
      .select('*, products(name)')
      .eq('id', id)
      .single();
    if (error) {
      throw error;
    }
    return data;
  },

  // Create inquiry
  async create(inquiry) {
    const { data, error } = await supabase
      .from('inquiries')
      .insert([inquiry])
      .select();
    if (error) {
      throw error;
    }
    return data[0];
  },

  // Update inquiry status
  async updateStatus(id, status) {
    const { data, error } = await supabase
      .from('inquiries')
      .update({ status })
      .eq('id', id)
      .select();
    if (error) {
      throw error;
    }
    return data[0];
  },

  // Delete inquiry
  async delete(id) {
    const { error } = await supabase
      .from('inquiries')
      .delete()
      .eq('id', id);
    if (error) {
      throw error;
    }
  },

  // Get inquiries by status
  async getByStatus(status) {
    const { data, error } = await supabase
      .from('inquiries')
      .select('*, products(name)')
      .eq('status', status)
      .order('created_at', { ascending: false });
    if (error) {
      throw error;
    }
    return data || [];
  },
};

// Payments service
export const paymentsService = {
  // Get all payments
  async getAll() {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  // Create payment
  async create(payment) {
    const { data, error } = await supabase
      .from('payments')
      .insert([payment])
      .select();
    if (error) throw error;
    return data[0];
  },

  // Update payment status
  async updateStatus(id, status, details = {}) {
    const { data, error } = await supabase
      .from('payments')
      .update({ status, ...details })
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  },
};
