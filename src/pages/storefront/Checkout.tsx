import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { UpsellStrip } from "../../components/commerce/UpsellStrip";
import { useCart } from "../../hooks/useCart";
import { useClientAuth } from "../../contexts/ClientAuthContext";
import { User } from "lucide-react";

// Validation helper functions
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone: string): boolean => {
  // Remove non-digit characters
  const cleanPhone = phone.replace(/\D/g, "");
  // Brazilian phone should have 10 or 11 digits
  return cleanPhone.length >= 10 && cleanPhone.length <= 11;
};

const validateCPF = (cpf: string): boolean => {
  if (!cpf) return true; // CPF is optional
  
  // Remove non-digit characters
  const cleanCPF = cpf.replace(/\D/g, "");
  
  // CPF should have 11 digits
  if (cleanCPF.length !== 11) return false;
  
  // Check if all digits are the same (invalid CPF)
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  // Validate CPF checksum
  let sum = 0;
  let remainder;
  
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;
  
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;
  
  return true;
};

export default function Checkout() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const { items, add, subtotal, lastAddedId, clear } = useCart();
  const { isAuthenticated, cliente } = useClientAuth();
  const [loading, setLoading] = useState(false);
  
  // Personal data form state (for non-authenticated users)
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cpf, setCpf] = useState("");
  
  // Address form state
  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [uf, setUf] = useState("");
  
  // Error states
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [cpfError, setCpfError] = useState("");

  const deliveryFee = 7.9;
  const total = subtotal + deliveryFee;

  // Auto-fill form with client data if authenticated
  useEffect(() => {
    if (isAuthenticated && cliente) {
      // Fill personal data
      setNome(cliente.nome || "");
      setEmail(cliente.email || "");
      setTelefone(cliente.telefone || "");
      setCpf(cliente.cpf || "");
      
      // Fill address data
      if (cliente.endereco) {
        setCep(cliente.endereco.cep || "");
        setRua(cliente.endereco.rua || "");
        setNumero(cliente.endereco.numero || "");
        setComplemento(cliente.endereco.complemento || "");
        setBairro(cliente.endereco.bairro || "");
        setCidade(cliente.endereco.cidade || "");
        setUf(cliente.endereco.uf || "");
      }
    }
  }, [isAuthenticated, cliente]);

  const confirm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setEmailError("");
    setPhoneError("");
    setCpfError("");
    
    // Validate personal data if not authenticated
    if (!isAuthenticated) {
      let hasError = false;
      
      if (!validateEmail(email)) {
        setEmailError("Email inválido");
        hasError = true;
      }
      
      if (!validatePhone(telefone)) {
        setPhoneError("Telefone inválido (deve ter 10 ou 11 dígitos)");
        hasError = true;
      }
      
      if (cpf && !validateCPF(cpf)) {
        setCpfError("CPF inválido");
        hasError = true;
      }
      
      if (hasError) {
        return;
      }
    }
    
    setLoading(true);

    try {
      // TODO: Implement order creation API call
      // If user is not authenticated, pass personal data to create account after order
      const orderData = {
        items,
        endereco: {
          cep,
          rua,
          numero,
          complemento,
          bairro,
          cidade,
          uf,
        },
        ...(!isAuthenticated && {
          dadosPessoais: {
            nome,
            email,
            telefone,
            cpf: cpf || null,
          },
        }),
      };
      
      // Simulate API call
      await new Promise((r) => setTimeout(r, 1000));
      
      // Store order data in sessionStorage for post-purchase flow
      if (!isAuthenticated) {
        sessionStorage.setItem("pendingAccount", JSON.stringify({
          nome,
          email,
          telefone,
          cpf: cpf || null,
          endereco: {
            cep,
            rua,
            numero,
            complemento,
            bairro,
            cidade,
            uf,
          },
        }));
      }

      clear();
      navigate(`/loja/${slug}/order-confirmation?pedido=12345`);
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Erro ao finalizar pedido. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-6">
      <div className="mx-auto max-w-5xl px-4">
        <h1 className="mb-4 text-2xl font-bold text-[#1F2937]">Checkout</h1>

        {/* Login Banner - Show if not authenticated */}
        {!isAuthenticated && (
          <div className="mb-4 rounded-md border border-[#FFC107] bg-[#FFC107]/10 p-4">
            <div className="flex items-center gap-3">
              <User className="text-[#D22630]" size={24} />
              <div className="flex-1">
                <p className="text-sm font-medium text-[#1F2937]">
                  Já tem uma conta? Faça login para um checkout mais rápido!
                </p>
                <p className="text-xs text-[#6B7280]">
                  Seus dados de entrega serão preenchidos automaticamente.
                </p>
              </div>
              <Link
                to={`/loja/${slug}/login`}
                state={{ from: `/loja/${slug}/checkout` }}
                className="rounded-md bg-[#D22630] px-4 py-2 text-sm font-medium text-white hover:bg-[#A01D26] transition-colors"
              >
                Entrar
              </Link>
            </div>
          </div>
        )}

        {/* Welcome message if authenticated */}
        {isAuthenticated && cliente && (
          <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-4">
            <p className="text-sm font-medium text-green-900">
              ✓ Olá, {cliente.nome}! Seus dados foram preenchidos automaticamente.
            </p>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <form onSubmit={confirm} className="lg:col-span-2 space-y-4 rounded-md border border-[#E5E7EB] bg-white p-4">
            {/* Personal Data Section - Only show if not authenticated */}
            {!isAuthenticated && (
              <div>
                <h2 className="mb-2 text-lg font-semibold text-[#1F2937]">Dados Pessoais</h2>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <Input
                      placeholder="Nome completo"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailError("");
                      }}
                      required
                    />
                    {emailError && (
                      <p className="mt-1 text-xs text-red-600">{emailError}</p>
                    )}
                  </div>
                  <div>
                    <Input
                      type="tel"
                      placeholder="Telefone"
                      value={telefone}
                      onChange={(e) => {
                        setTelefone(e.target.value);
                        setPhoneError("");
                      }}
                      required
                    />
                    {phoneError && (
                      <p className="mt-1 text-xs text-red-600">{phoneError}</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <Input
                      placeholder="CPF (opcional, recomendado para nota fiscal)"
                      value={cpf}
                      onChange={(e) => {
                        setCpf(e.target.value);
                        setCpfError("");
                      }}
                    />
                    {cpfError && (
                      <p className="mt-1 text-xs text-red-600">{cpfError}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            <div>
              <h2 className="mb-2 text-lg font-semibold text-[#1F2937]">Endereço de entrega</h2>
              <div className="grid gap-3 md:grid-cols-2">
                <Input
                  placeholder="CEP"
                  value={cep}
                  onChange={(e) => setCep(e.target.value)}
                  required
                />
                <Input
                  placeholder="Rua"
                  value={rua}
                  onChange={(e) => setRua(e.target.value)}
                  required
                />
                <Input
                  placeholder="Número"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  required
                />
                <Input
                  placeholder="Complemento"
                  value={complemento}
                  onChange={(e) => setComplemento(e.target.value)}
                />
                <Input
                  placeholder="Bairro"
                  value={bairro}
                  onChange={(e) => setBairro(e.target.value)}
                  required
                />
                <Input
                  placeholder="Cidade"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  required
                />
                <Input
                  placeholder="UF"
                  value={uf}
                  onChange={(e) => setUf(e.target.value)}
                  required
                  maxLength={2}
                />
              </div>
            </div>
            <div>
              <h2 className="mb-2 text-lg font-semibold text-[#1F2937]">Pagamento</h2>
              <div className="rounded-md border border-dashed border-[#E5E7EB] p-6 text-center text-[#4B5563]">
                Form de pagamento Asaas aqui
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Input placeholder="Cupom de desconto" />
              <Button variant="ghost" type="button">Aplicar</Button>
            </div>
            <Button type="submit" loading={loading} variant="primary" className="w-full" disabled={items.length === 0}>
              Finalizar pedido
            </Button>
          </form>

          <aside className="space-y-3">
            <div className="rounded-md border border-[#E5E7EB] bg-white p-4">
              <h3 className="mb-3 text-lg font-semibold text-[#1F2937]">Resumo do pedido</h3>
              <ul className="mb-3 space-y-2 border-b border-[#E5E7EB] pb-3">
                {items.map((it) => (
                  <li key={it.id} className="flex items-center justify-between text-sm">
                    <span className="text-[#4B5563]">
                      {it.title} <span className="text-[#9CA3AF]">x{it.qty}</span>
                    </span>
                    <span className="font-medium text-[#1F2937]">R$ {(it.price * it.qty).toFixed(2)}</span>
                  </li>
                ))}
              </ul>

              <UpsellStrip
                lastAddedId={lastAddedId}
                cartIds={items.map((i) => i.id)}
                onAdd={(p) => add({ id: p.id, title: p.title, price: p.price }, 1)}
                title="Complete seu pedido com"
              />

              <div className="space-y-2 border-t border-[#E5E7EB] pt-3">
                <div className="flex justify-between text-sm text-[#4B5563]">
                  <span>Subtotal</span>
                  <span>R$ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-[#4B5563]">
                  <span>Entrega</span>
                  <span>R$ {deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-semibold text-[#1F2937]">
                  <span>Total</span>
                  <span>R$ {total.toFixed(2)}</span>
                </div>
              </div>
            </div>
            <div className="rounded-md border border-[#E5E7EB] bg-[#FFC107]/10 p-3 text-sm text-[#1F2937]">
              Pagamento realizado com segurança via Asaas.
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
