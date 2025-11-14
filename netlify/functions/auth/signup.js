import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { username, email, password } = req.body;

  if (!username || !email || !password)
    return res.status(400).json({ error: 'Missing fields' });

  const hashed = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from('users')
    .insert([{ username, email, password_hash: hashed }])
    .select();

  if (error) return res.status(400).json({ error: error.message });

  const token = jwt.sign(
    { id: data[0].id, username },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.status(200).json({ token, user: data[0] });
}
