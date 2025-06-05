import supabase from '@/lib/supabase';

export interface Scan {
  id: string;
  url: string;
  user_id: string;
  cookieBannerFound: boolean;
  privacyPolicyFound: boolean;
  formDetected: boolean;
  score: number;
  suggestions: string[];
  pro: boolean;
  created_at: string;
}

export const getUserScans = async (userId: string): Promise<Scan[]> => {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('scans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as Scan[]) || [];
};

export const getScanById = async (id: string): Promise<Scan | null> => {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('scans')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return (data as Scan) || null;
};
