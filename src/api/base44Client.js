// Standalone data/auth client — fully independent of Base44.
// Kept the same export name/shape (`base44.auth`, `base44.entities.*`) so the
// rest of the app didn't need to change, but everything here now talks
// directly to Supabase (Postgres + Auth).
import { supabase } from '@/api/supabaseClient';

const ENTITY_TABLES = {
  Company: 'companies',
  Client: 'clients',
  Service: 'services',
  Lead: 'leads',
  Deal: 'deals',
  Expense: 'expenses',
  Payment: 'payments',
  FollowUp: 'follow_ups',
  Activity: 'activities',
};

function applySort(query, sort) {
  if (!sort) return query;
  const desc = sort.startsWith('-');
  const column = desc ? sort.slice(1) : sort;
  return query.order(column, { ascending: !desc });
}

function makeEntity(table) {
  return {
    async list(sort, limit = 200) {
      let q = supabase.from(table).select('*');
      q = applySort(q, sort);
      if (limit) q = q.limit(limit);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },

    async filter(query = {}, sort, limit = 200) {
      let q = supabase.from(table).select('*');
      Object.entries(query).forEach(([key, value]) => {
        q = q.eq(key, value);
      });
      q = applySort(q, sort);
      if (limit) q = q.limit(limit);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },

    async get(id) {
      const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    },

    async create(payload) {
      const { data: userData } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from(table)
        .insert({ ...payload, created_by: userData?.user?.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async update(id, payload) {
      const { data, error } = await supabase.from(table).update(payload).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },

    async delete(id) {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      return true;
    },
  };
}

const entities = Object.fromEntries(
  Object.entries(ENTITY_TABLES).map(([name, table]) => [name, makeEntity(table)])
);

const auth = {
  async me() {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) throw new Error('Not authenticated');
    const user = data.user;
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', user.id)
      .single();
    return {
      id: user.id,
      email: user.email,
      full_name: profile?.full_name || user.user_metadata?.full_name || '',
      role: profile?.role || 'user',
    };
  },

  async loginViaEmailPassword(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  loginWithProvider(provider = 'google', redirectPath = '/') {
    return supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}${redirectPath}` },
    });
  },

  async register({ email, password }) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  },

  async verifyOtp({ email, otpCode }) {
    const { data, error } = await supabase.auth.verifyOtp({ email, token: otpCode, type: 'signup' });
    if (error) throw error;
    return { access_token: data?.session?.access_token };
  },

  setToken() {
    // No-op: Supabase manages the session/token internally after verifyOtp/signIn.
  },

  async resendOtp(email) {
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) throw error;
  },

  async resetPasswordRequest(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  },

  async resetPassword({ newPassword }) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  },

  async logout(redirectUrl) {
    await supabase.auth.signOut();
    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  },

  redirectToLogin() {
    window.location.href = '/login';
  },
};

export const base44 = { auth, entities };
