import { createClient } from "@supabase/supabase-js";

const supabaseUrl = 'https://lbbbfdmyavhsxqofagfo.supabase.co';
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxiYmJmZG15YXZoc3hxb2ZhZ2ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4NzE3MzYsImV4cCI6MjA4MTQ0NzczNn0.d2bNVuAHaBRA8nmEKwnRDDtJ4e82fLeLTaSr732bHVQ";

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);
