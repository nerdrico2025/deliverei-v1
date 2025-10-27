import React from "react";
import { PublicHeader } from "../../components/layout/PublicHeader";
import { Button } from "../../components/common/Button";
import '../../styles/animations.css'

export default function Home() {
  return (
    <>
      <PublicHeader />
      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-2">
          <div>
            <h1 className="mb-4 text-3xl font-bold text-[#1F2937]">
              Gestão de delivery de marmitas, simples e completa
            </h1>
            <p className="mb-6 text-[#4B5563]">
              Crie sua vitrine, receba pedidos e automatize o WhatsApp com poucos cliques.
            </p>
            <div className="flex gap-3">
              <a href="/login">
                <Button variant="primary">Entrar</Button>
              </a>
            </div>
          </div>
          <div className="rounded-md border border-[#E5E7EB] bg-white p-6 shadow-sm">
            <img 
              src="https://hmlxtjcgkbzczwsjvdvl.supabase.co/storage/v1/object/public/site/home-deliverei.webp" 
              alt="Deliverei - Gestão de delivery de marmitas"
              className="h-48 w-full rounded object-cover"
            />
          </div>
        </div>
      </section>

      <section id="features" className="bg-gradient-to-br from-gray-50 to-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#1F2937] mb-4">Funcionalidades</h2>
            <p className="text-lg text-[#6B7280] max-w-2xl mx-auto">
              Descubra como nossa plataforma pode revolucionar seu negócio de delivery
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              { 
                t: "Assistente de Atendimento (Chatbot com IA)", 
                d: "Facilite o atendimento pelo WhatsApp com nosso Chatbot inteligente. Ele utiliza Inteligência Artificial para responder perguntas, capturar informações e oferecer suporte personalizado aos seus clientes.",
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                ),
                gradient: "from-blue-500 to-purple-600"
              },
              { 
                t: "Impressão Automática de Pedidos", 
                d: "Imprima pedidos automaticamente em diversas impressoras, com a opção de escolher quantas vias deseja. Isso agiliza o processo e garante eficiência na operação.",
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                ),
                gradient: "from-green-500 to-teal-600"
              },
              { 
                t: "Pagamento Online com Taxas Reduzidas", 
                d: "Além do pagamento presencial, oferecemos também pagamento online com taxas mais competitivas do que os grandes players do mercado, garantindo economia e praticidade para seu negócio.",
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                ),
                gradient: "from-yellow-500 to-orange-600"
              },
              { 
                t: "Integração com WhatsApp", 
                d: "Envie notificações automáticas sobre o andamento dos pedidos e programe campanhas automáticas com disparos únicos, segmentadas para grupos específicos de clientes.",
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                ),
                gradient: "from-green-600 to-emerald-700"
              },
              { 
                t: "Integração com iFood", 
                d: "Gerencie seus pedidos de forma simples e eficiente. Nossa integração com o iFood facilita a gestão e garante que todos os pedidos sejam delivery. A NEC-e pode ser emitida automaticamente, simplificando ainda mais o processo.",
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                gradient: "from-red-500 to-pink-600"
              },
              { 
                t: "Delivery, Encomenda e Retirada", 
                d: "Ofereça conveniência total com opções flexíveis de entrega. Seja para delivery, encomenda ou retirada no local, nosso sistema se adapta perfeitamente às necessidades do seus clientes.",
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                ),
                gradient: "from-indigo-500 to-blue-600"
              },
            ].map((feature, index) => (
                <div 
                  key={feature.t} 
                  className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 overflow-hidden animate-fade-in-up hover-lift"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-r ${feature.gradient} text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-[#1F2937] mb-4 group-hover:text-gray-900 transition-colors duration-300">
                    {feature.t}
                  </h3>
                  <p className="text-[#6B7280] leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                    {feature.d}
                  </p>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Escolha Seu Plano</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Soluções flexíveis para negócios de todos os tamanhos
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                name: "Starter",
                price: "R$ 97",
                period: "/mês",
                description: "Perfeito para começar seu delivery",
                features: [
                  "Até 100 pedidos/mês",
                  "Vitrine básica",
                  "WhatsApp integrado",
                  "Suporte por email",
                  "1 usuário"
                ],
                popular: false,
                gradient: "from-blue-500 to-blue-600",
                bgGradient: "from-blue-50 to-blue-100",
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )
              },
              {
                name: "Professional",
                price: "R$ 197",
                period: "/mês",
                description: "Para negócios em crescimento",
                features: [
                  "Pedidos ilimitados",
                  "Vitrine personalizada",
                  "Chatbot com IA",
                  "Impressão automática",
                  "Integração iFood",
                  "Analytics avançado",
                  "5 usuários",
                  "Suporte prioritário"
                ],
                popular: true,
                gradient: "from-purple-500 to-pink-600",
                bgGradient: "from-purple-50 to-pink-100",
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                )
              },
              {
                name: "Enterprise",
                price: "R$ 397",
                period: "/mês",
                description: "Solução completa para grandes operações",
                features: [
                  "Tudo do Professional",
                  "Multi-lojas",
                  "API personalizada",
                  "Relatórios customizados",
                  "Integração ERP",
                  "Usuários ilimitados",
                  "Suporte 24/7",
                  "Gerente dedicado"
                ],
                popular: false,
                gradient: "from-emerald-500 to-teal-600",
                bgGradient: "from-emerald-50 to-teal-100",
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                )
              }
            ].map((plan, index) => (
              <div 
                key={plan.name} 
                className={`relative group ${plan.popular ? 'transform scale-105' : ''}`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                    <span className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                      Mais Popular
                    </span>
                  </div>
                )}
                <div className={`relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border-2 ${plan.popular ? 'border-purple-200' : 'border-gray-100'} overflow-hidden animate-fade-in-up hover-lift hover-glow`}>
                  {/* Background Pattern */}
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${plan.bgGradient} rounded-full transform translate-x-16 -translate-y-16 opacity-20`}></div>
                  
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${plan.gradient} text-white mb-6 group-hover:scale-110 transition-transform duration-300 relative z-10 animate-float`}>
                    {plan.icon}
                  </div>
                  
                  {/* Plan Name */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 relative z-10">{plan.name}</h3>
                  
                  {/* Price */}
                  <div className="mb-4 relative z-10">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600 text-lg">{plan.period}</span>
                  </div>
                  
                  {/* Description */}
                  <p className="text-gray-600 mb-8 relative z-10">{plan.description}</p>
                  
                  {/* Features */}
                  <ul className="space-y-4 mb-8 relative z-10">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${plan.gradient} flex items-center justify-center mr-3 flex-shrink-0`}>
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {/* CTA Button */}
                  <a href="/cadastro-empresa" className="block relative z-10">
                    <button className={`w-full py-4 px-6 rounded-xl font-bold text-white bg-gradient-to-r ${plan.gradient} hover:shadow-lg transform hover:scale-105 transition-all duration-300 ${plan.popular ? 'shadow-lg' : ''}`}>
                      {plan.popular ? 'Começar Agora' : 'Escolher Plano'}
                    </button>
                  </a>
                  
                  {/* Decorative Elements */}
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Additional Info */}
          <div className="text-center mt-12">
            <p className="text-gray-400 mb-4">Todos os planos incluem 14 dias de teste grátis</p>
            <div className="flex justify-center space-x-8 text-sm text-gray-500">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Sem taxa de setup
              </span>
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Cancele quando quiser
              </span>
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Suporte especializado
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
