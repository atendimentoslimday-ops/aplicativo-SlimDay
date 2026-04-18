-- 1. Ativar RLS nas tabelas principais
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- 2. Política para PROFILES (Usuário só vê e edita o seu próprio perfil)
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- 3. Política para PURCHASES (Usuário só vê suas próprias compras)
CREATE POLICY "Users can view own purchases" 
ON purchases FOR SELECT 
USING (auth.uid() = user_id);

-- 4. Permitir que o SISTEMA (Service Role) continue funcionando normalmente
-- (As chaves de Service Role do Supabase ignoram RLS, o que é o comportamento esperado para o Admin)

-- 5. SEGURANÇA EXTRA: Impedir deleção acidental de perfis por usuários
CREATE POLICY "No one can delete profiles except service role" 
ON profiles FOR DELETE 
USING (false);
