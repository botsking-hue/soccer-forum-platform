import { supabase } from '../../../../../lib/supabaseClient';
import { authenticate } from '../../../../../lib/authMiddleware';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const user = authenticate(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { threadId, content } = req.body;
  if (!threadId || !content) return res.status(400).json({ error: 'Missing fields' });

  const { data, error } = await supabase
    .from('replies')
    .insert([{ thread_id: threadId, user_id: user.id, content }])
    .select();

  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json({ reply: data[0] });
}
