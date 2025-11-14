import { supabase } from '../../../../lib/supabaseClient';

export default async function handler(req, res) {
  const { data: forum, error: forumError } = await supabase
    .from('forums')
    .select('id')
    .eq('slug', 'fifa14')
    .single();

  if (forumError) return res.status(404).json({ error: 'Forum not found' });

  const { data: threads, error } = await supabase
    .from('threads')
    .select('*')
    .eq('forum_id', forum.id)
    .order('created_at', { ascending: false });

  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json({ threads });
}
