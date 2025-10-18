# Configuração do Supabase Storage para Upload de Imagens

## Visão Geral

Este documento descreve como configurar o Supabase Storage para permitir o upload de imagens de produtos no sistema DELIVEREI.

## Pré-requisitos

- Conta no Supabase
- Projeto criado no Supabase
- Credenciais do projeto (URL e Anon Key)

## Passo a Passo

### 1. Acessar o Dashboard do Supabase

1. Acesse [https://app.supabase.com](https://app.supabase.com)
2. Faça login com sua conta
3. Selecione o projeto DELIVEREI (ou o nome que você deu ao projeto)

### 2. Criar o Bucket de Storage

1. No menu lateral, clique em **Storage**
2. Clique no botão **New bucket**
3. Configure o bucket com os seguintes dados:
   - **Name**: `produtos`
   - **Public bucket**: ✅ Marque esta opção (para permitir acesso público às imagens)
   - **File size limit**: 5 MB (opcional, mas recomendado)
   - **Allowed MIME types**: `image/jpeg, image/jpg, image/png, image/webp, image/gif`

4. Clique em **Create bucket**

### 3. Configurar as Políticas de Acesso (RLS Policies)

Por padrão, mesmo com o bucket público, é necessário configurar as políticas de acesso. Configure as seguintes políticas:

#### Política 1: Upload de Imagens (INSERT)

```sql
CREATE POLICY "Allow authenticated users to upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'produtos' AND
  (storage.foldername(name))[1] = 'authenticated'
);
```

Ou, se quiser permitir upload público (não recomendado para produção):

```sql
CREATE POLICY "Allow public upload to produtos bucket"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'produtos');
```

#### Política 2: Leitura de Imagens (SELECT)

```sql
CREATE POLICY "Allow public read access to produtos bucket"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'produtos');
```

#### Política 3: Deletar Imagens (DELETE)

```sql
CREATE POLICY "Allow authenticated users to delete their images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'produtos');
```

### 4. Configurar via UI (Alternativa mais simples)

Se preferir configurar via interface:

1. Na página do bucket `produtos`, clique na aba **Policies**
2. Clique em **New Policy**
3. Selecione o template apropriado:
   - **Policy for INSERT**: Selecione "Allow public access" ou "Allow authenticated users"
   - **Policy for SELECT**: Selecione "Allow public access" (para visualização das imagens)
   - **Policy for DELETE**: Selecione "Allow authenticated users"

### 5. Verificar Configuração

Para verificar se está tudo funcionando:

1. Tente fazer upload de uma imagem através da interface do Supabase Storage
2. Clique na imagem e copie a URL pública
3. Abra a URL em uma nova aba do navegador para confirmar que está acessível

## Configuração no Projeto

As credenciais do Supabase já estão configuradas no arquivo `.env.local`:

```env
VITE_SUPABASE_URL=https://yfqxqxqxqxqxqxqxqxqx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Estrutura de Arquivos

O sistema salvará as imagens com a seguinte estrutura:

```
produtos/
├── {timestamp}-{random}.jpg
├── {timestamp}-{random}.png
└── ...
```

Cada arquivo terá um nome único gerado automaticamente para evitar conflitos.

## Segurança

### Recomendações de Segurança:

1. **Validação de Tipo de Arquivo**: O sistema já valida os tipos de arquivo permitidos (JPEG, PNG, WebP, GIF)
2. **Tamanho Máximo**: O sistema limita o upload a 5MB
3. **Autenticação**: Apenas usuários autenticados podem fazer upload
4. **Rate Limiting**: Configure rate limiting no Supabase para evitar abuso

### Políticas Recomendadas para Produção:

```sql
-- Permitir apenas usuários autenticados a fazer upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'produtos');

-- Permitir leitura pública das imagens
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'produtos');

-- Permitir apenas usuários autenticados a deletar suas próprias imagens
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'produtos');
```

## Troubleshooting

### Problema: Upload falha com erro 403

**Solução**: Verifique se as políticas de acesso estão configuradas corretamente.

### Problema: Imagens não aparecem

**Solução**: 
1. Verifique se o bucket está marcado como público
2. Verifique se a política de SELECT está configurada para `public`
3. Verifique se a URL da imagem está correta

### Problema: Erro de CORS

**Solução**: O Supabase já configura CORS automaticamente, mas se necessário, você pode adicionar domínios permitidos nas configurações do projeto.

## Limpeza de Imagens Antigas (Opcional)

Para economizar espaço, você pode criar uma função no Supabase que limpa imagens não utilizadas:

```sql
-- Função para limpar imagens órfãs
CREATE OR REPLACE FUNCTION cleanup_orphaned_images()
RETURNS void AS $$
BEGIN
  -- Deletar imagens do storage que não estão referenciadas em nenhum produto
  DELETE FROM storage.objects
  WHERE bucket_id = 'produtos'
  AND name NOT IN (
    SELECT SUBSTRING(imagem FROM '.*/(.+)$')
    FROM produtos
    WHERE imagem IS NOT NULL
  );
END;
$$ LANGUAGE plpgsql;
```

E agendar a execução periódica via pg_cron ou outro scheduler.

## Suporte

Para mais informações, consulte a [documentação oficial do Supabase Storage](https://supabase.com/docs/guides/storage).
