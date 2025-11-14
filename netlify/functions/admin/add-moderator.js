import { supabase } from '../../lib/supabaseClient';
import { authenticate } from '../../lib/authMiddleware';

export default async function handler(req,res){
  const user = authenticate(req);
  if(!user || user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

  const { user_id } = req.body;
  const { data, error } = await supabase
    .from('users')
    .update({ role: 'moderator' })
    .eq('id', user_id)
    .select();

  if(error) return res.status(400).json({ error: error.message });
  res.status(200).json({ updated: data[0] });
}
