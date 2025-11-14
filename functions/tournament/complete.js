import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  const { fixture_id, score1, score2 } = req.body;
  if(!fixture_id) return res.status(400).json({ error: 'Missing fixture_id' });

  const { data, error } = await supabase
    .from('tournament_fixtures')
    .update({ score1, score2, status: 'completed' })
    .eq('id', fixture_id)
    .select();

  if(error) return res.status(400).json({ error: error.message });
  res.status(200).json({ fixture: data[0] });
}
