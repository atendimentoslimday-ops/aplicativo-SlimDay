# SlimDay - Repositório Organizado

Este repositório contém a infraestrutura do SlimDay dividida em 3 projetos independentes para garantir a separação total de funções e domínios.

## Estrutura do Projeto

### 1. [Vendas SlimDay](file:///./vendas-slimday)
- **Função**: Landing Page oficial de vendas do SlimDay.
- **Deploy no Vercel**: 
  - Root Directory: `vendas-slimday`
  - Framework: `Vite`

### 2. [Aplicativo SlimDay](file:///./aplicativo-slimday)
- **Função**: Dashboard e Área do Aluno.
- **Deploy no Vercel**: 
  - Root Directory: `aplicativo-slimday`
  - Framework: `Vite`

### 3. [Vendas CicloPlus](file:///./vendas-cicloplus)
- **Função**: Página de vendas do calendário CicloPlus.
- **Deploy no Vercel**: 
  - Root Directory: `vendas-cicloplus`
  - Framework: `Vite`

---

## Configuração do Supabase
Todos os 3 projetos compartilham a mesma infraestrutura do Supabase de forma isolada, garantindo que os dados de compras e usuários sejam centralizados.

Para configurar, adicione as seguintes Variáveis de Ambiente em cada projeto do Vercel:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
