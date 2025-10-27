// @ts-nocheck
// deno-lint-ignore-file
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import bcrypt from "npm:bcryptjs";

// Hint para o verificador TS local (Node): declarar Deno para evitar diagnósticos.
declare const Deno: { env: { get(name: string): string | undefined } };

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const jsonHeaders = {
  "Content-Type": "application/json",
  ...corsHeaders,
};

function normalizeSlug(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function response(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders });
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return response(405, { message: "Method not allowed" });
  }

  try {
    const payload = await req.json();

    const required = [
      "nomeEmpresa",
      "slug",
      "endereco",
      "cidade",
      "estado",
      "cep",
      "nomeAdmin",
      "emailAdmin",
      "senhaAdmin",
    ];

    for (const f of required) {
      if (!payload[f] || String(payload[f]).trim().length === 0) {
        return response(400, { message: `Campo obrigatório ausente: ${f}` });
      }
    }

    const slug = normalizeSlug(String(payload.slug));
    const emailAdmin = String(payload.emailAdmin).toLowerCase().trim();
    const senhaAdmin = String(payload.senhaAdmin);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceKey) {
      return response(500, {
        message: "Configuração do Supabase ausente (SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY).",
      });
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // Verificar se slug já existe
    const { data: empresas, error: slugSelectError } = await supabase
      .from("empresas")
      .select("id")
      .eq("slug", slug);

    if (slugSelectError) {
      return response(500, { message: "Erro ao verificar slug", details: slugSelectError.message });
    }

    if (empresas && empresas.length > 0) {
      return response(409, { message: "Slug em uso" });
    }

    // Criar usuário de autenticação
    const { data: userCreate, error: userCreateError } = await supabase.auth.admin.createUser({
      email: emailAdmin,
      password: senhaAdmin,
      email_confirm: true,
      user_metadata: { nome: payload.nomeAdmin, tipo: "ADMIN_EMPRESA" },
    });

    if (userCreateError) {
      const msg = /already exists/i.test(userCreateError.message)
        ? "Email já cadastrado"
        : userCreateError.message;
      return response(409, { message: msg });
    }

    const userId = userCreate?.user?.id;
    if (!userId) {
      return response(500, { message: "Falha ao criar usuário" });
    }

    // Inserir empresa
    const empresaInsert = {
      nome: String(payload.nomeEmpresa),
      slug,
      email: emailAdmin,
      telefone: payload.telefoneEmpresa ?? null,
      endereco: String(payload.endereco),
      cidade: String(payload.cidade),
      estado: String(payload.estado),
      cep: String(payload.cep),
      ativo: true,
    };

    const { data: empresa, error: empresaError } = await supabase
      .from("empresas")
      .insert(empresaInsert)
      .select("*")
      .single();

    if (empresaError) {
      return response(500, { message: "Erro ao criar empresa", details: empresaError.message });
    }

    // Gerar hash de senha para uso pelo backend
    const senhaHash = bcrypt.hashSync(senhaAdmin, 10);

    // Vincular perfil do usuário admin à empresa
    const usuarioInsert = {
      id: userId,
      empresaId: empresa.id,
      nome: String(payload.nomeAdmin),
      email: emailAdmin,
      senha: senhaHash,
      telefone: payload.telefoneAdmin ?? null,
      tipo: "ADMIN_EMPRESA",
    };

    const { data: usuario, error: usuarioError } = await supabase
      .from("usuarios")
      .insert(usuarioInsert)
      .select("*")
      .single();

    if (usuarioError) {
      return response(500, { message: "Erro ao criar usuário admin", details: usuarioError.message });
    }

    const result = {
      empresa: { id: empresa.id, nome: empresa.nome, slug: empresa.slug },
      user: { id: userId, email: emailAdmin, nome: String(payload.nomeAdmin), tipo: "ADMIN_EMPRESA", empresaId: empresa.id },
    };

    return response(201, result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return response(500, { message });
  }
});