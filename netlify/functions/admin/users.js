import { supabase } from '../../lib/supabaseClient';
import { authenticate } from '../../lib/authMiddleware';

export default async function handler(req,res){
  const user = authenticate(req);
  if(!user || user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

  const { data, error } = await supabase.from('users').select('*');
  if(error) return res.status(400).json({ error: error.message });
  res.status(200).json({ users: data });
}
