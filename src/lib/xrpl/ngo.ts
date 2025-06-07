import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getRegisteredNGOs() {
  try {
    const { data: ngos, error } = await supabase
      .from('ngos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching NGOs:', error);
      return [];
    }

    return ngos || [];
  } catch (error) {
    console.error('Error in getRegisteredNGOs:', error);
    return [];
  }
} 