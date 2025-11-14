import { supabase } from '../../../../lib/supabaseClient';
import { authenticate } from '../../../../lib/authMiddleware';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const user = authenticate(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { title, content, tags } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'Missing fields' });

  const { data: forum } = await supabase
    .from('forums')
    .select('id')
    .eq('slug', 'others')
    .single();

  const { data, error } = await supabase
    .from('threads')
    .insert([{ forum_id: forum.id, creator_id: user.id, title, content, tags }])
    .select();

  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json({ thread: data[0] });
}
