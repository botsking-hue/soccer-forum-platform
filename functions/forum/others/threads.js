import { supabase } from '../../../../lib/supabaseClient';

export default async function handler(req, res) {
  const { data: forum } = await supabase
    .from('forums')
    .select('id')
    .eq('slug', 'others')
    .single();

  const { data: threads, error } = await supabase
    .from('threads')
    .select('*')
    .eq('forum_id', forum.id)
    .order('created_at', { ascending: false });

  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json({ threads });
}
