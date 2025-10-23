
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardShell } from "../../../components/layout/DashboardShell";
import { StoreSidebar } from "../../../components/layout/StoreSidebar";
import { Button } from "../../../components/common/Button";
import { Input } from "../../../components/common/Input";
import { X, Loader2, Pencil, Trash2, ArrowUpDown, ArrowUp, ArrowDown, Search } from "lucide-react";
import { useAuth } from "../../../auth/AuthContext";
import { formatCurrency } from "../../../utils/formatters";
import { useToast } from "../../../ui/feedback/ToastContext";
import { ProductForm, ProductFormData } from "../../../components/products/ProductForm";
import { getProducts, createProduct, deleteProduct, updateProduct, Product } from "../../../services/productsApi";
import { usePagination } from "../../../hooks/usePagination";
import { getErrorMessage, isNetworkError, isTimeoutError } from "../../../services/api.utils";

// Sorting keys for the table
type SortKey = "id" | "nome" | "estoque" | "preco" | "status";

type ErrorState = { message: string; type: 'network' | 'timeout' | 'unauthorized' | 'generic' } | null;

export default function ProductsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { push } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; product?: Product }>({ open: false });
  const [list, setList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ErrorState>(null);

  // Adição: edição inline de estoque e configuração de marketing
  const [quantityEdits, setQuantityEdits] = useState<Record<string, number>>({});
  const [savingQty, setSavingQty] = useState<Record<string, boolean>>({});
  type MarketingSettings = { enableLowStock: boolean; lowStockThreshold: number; lowStockMessage: string };
  const [marketing, setMarketing] = useState<MarketingSettings>({ enableLowStock: true, lowStockThreshold: 5, lowStockMessage: "Últimas unidades!" });

  // Filters and sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<{ disponivel: boolean; esgotado: boolean }>({ disponivel: false, esgotado: false });
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [sortBy, setSortBy] = useState<SortKey>("id");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const pagination = usePagination(1, 10);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getProducts({ ativo: undefined });
      setList(response.data);
    } catch (err) {
      console.error('Error fetching products:', err);
      const msg = getErrorMessage(err);
      const type: ErrorState['type'] = isNetworkError(err)
        ? 'network'
        : isTimeoutError(err)
        ? 'timeout'
        : (typeof msg === 'string' && msg.toLowerCase().includes('não autorizado'))
        ? 'unauthorized'
        : 'generic';
      setError({ message: msg, type });
      push({ message: `Erro ao carregar produtos: ${msg}`, tone: 'error' });
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.empresaId) {
      fetchProducts();
    }
  }, [user?.empresaId]);

  // Carregar configurações de marketing salvas
  useEffect(() => {
    try {
      const raw = localStorage.getItem("deliverei_marketing_settings");
      if (raw) {
        const parsed = JSON.parse(raw);
        setMarketing((prev) => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      // ignore parse errors
    }
  }, []);

  // Derived data
  const categories = useMemo(() => Array.from(new Set(list.map(p => p.categoria).filter(Boolean))) as string[], [list]);

  const filtered = useMemo(() => {
    return list.filter(p => {
      // Search by name or code
      const term = searchTerm.trim().toLowerCase();
      const matchesSearch = term.length === 0 || p.nome.toLowerCase().includes(term) || p.id.toLowerCase().includes(term);

      // Category multiselect
      const matchesCategory = selectedCategories.length === 0 || (p.categoria ? selectedCategories.includes(p.categoria) : false);

      // Status filter (disponível/esgotado by estoque)
      const isDisponivel = p.estoque > 0;
      const matchesStatus = (!statusFilter.disponivel && !statusFilter.esgotado) ||
        (statusFilter.disponivel && isDisponivel) ||
        (statusFilter.esgotado && !isDisponivel);

      // Price range
      const matchesPrice = Number(p.preco) >= priceRange[0] && Number(p.preco) <= priceRange[1];

      return matchesSearch && matchesCategory && matchesStatus && matchesPrice;
    });
  }, [list, searchTerm, selectedCategories, statusFilter, priceRange]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let av: number | string = "";
      let bv: number | string = "";
      switch (sortBy) {
        case "id":
          av = a.id; bv = b.id; break;
        case "nome":
          av = a.nome; bv = b.nome; break;
        case "estoque":
          av = a.estoque; bv = b.estoque; break;
        case "preco":
          av = Number(a.preco); bv = Number(b.preco); break;
        case "status":
          av = a.estoque > 0 ? 'disponivel' : 'esgotado';
          bv = b.estoque > 0 ? 'disponivel' : 'esgotado';
          break;
      }
      if (typeof av === 'string' && typeof bv === 'string') {
        const cmp = av.localeCompare(bv);
        return sortDir === 'asc' ? cmp : -cmp;
      }
      const cmp = (av as number) - (bv as number);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return arr;
  }, [filtered, sortBy, sortDir]);

  useEffect(() => {
    pagination.setTotal(sorted.length);
  }, [sorted.length]);

  const paged = useMemo(() => {
    const start = (pagination.page - 1) * pagination.limit;
    const end = start + pagination.limit;
    return sorted.slice(start, end);
  }, [sorted, pagination.page, pagination.limit]);

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortDir('asc');
    }
  };

  const handleCreate = async (data: ProductFormData) => {
    try {
      setSubmitting(true);
      await createProduct({
        nome: data.nome,
        descricao: data.descricao,
        preco: data.preco,
        imagem: data.imagem,
        estoque: data.estoque,
        categoria: data.categoria,
        ativo: data.ativo,
        promo_tag: data.promo_tag,
        bestseller_tag: data.bestseller_tag,
        new_tag: data.new_tag,
      });
      push({ message: 'Produto criado com sucesso!', tone: 'success' });
      setModalOpen(false);
      await fetchProducts();
    } catch (error) {
      console.error('Error creating product:', error);
      push({ message: 'Erro ao criar produto', tone: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (data: ProductFormData) => {
    if (!selectedProduct) return;
    try {
      setSubmitting(true);
      await updateProduct(selectedProduct.id, {
        nome: data.nome,
        descricao: data.descricao,
        preco: data.preco,
        imagem: data.imagem,
        estoque: data.estoque,
        categoria: data.categoria,
        ativo: data.ativo,
        promo_tag: data.promo_tag,
        bestseller_tag: data.bestseller_tag,
        new_tag: data.new_tag,
      });
      push({ message: 'Produto atualizado com sucesso!', tone: 'success' });
      setEditModalOpen(false);
      setSelectedProduct(null);
      await fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      push({ message: 'Erro ao atualizar produto', tone: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      push({ message: 'Produto excluído com sucesso!', tone: 'success' });
      await fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      push({ message: 'Erro ao excluir produto', tone: 'error' });
    }
  };

  // Salvar quantidade editada
  const saveQuantity = async (id: string) => {
    const newQty = quantityEdits[id];
    const product = list.find(p => p.id === id);
    if (product == null || newQty === undefined || newQty === product.estoque) return;
    setSavingQty((s) => ({ ...s, [id]: true }));
    try {
      await updateProduct(id, { estoque: newQty });
      setList((prev) => prev.map((p) => p.id === id ? { ...p, estoque: newQty, ativo: newQty > 0 ? p.ativo : false } : p));
      push({ message: 'Estoque atualizado', tone: 'success' });
    } catch (e) {
      console.error('Error updating stock:', e);
      push({ message: 'Erro ao atualizar estoque', tone: 'error' });
    } finally {
      setSavingQty((s) => ({ ...s, [id]: false }));
    }
  };

  const handleQtyKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, id: string, original: number) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
      void saveQuantity(id);
    } else if (e.key === 'Escape') {
      setQuantityEdits((prev) => ({ ...prev, [id]: original }));
      e.currentTarget.blur();
    }
  };

  return (
    <DashboardShell sidebar={<StoreSidebar />}> 
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#1F2937]">Estoque</h1>
        <Button onClick={() => setModalOpen(true)}>Adicionar Produto</Button>
      </div>

      {error && (
        <div className="mb-4 flex items-start justify-between gap-4 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <div>
            <div className="font-medium">Não foi possível carregar os produtos.</div>
            <div className="mt-1">{error.message}</div>
            {error.type === 'network' && (
              <div className="mt-1 text-red-700/80">Verifique sua conexão e se o backend está em execução.</div>
            )}
          </div>
          <div className="shrink-0 flex items-center gap-2">
            <Button variant="outline" onClick={fetchProducts}>Tentar novamente</Button>
            {error.type === 'unauthorized' && (
              <Button variant="secondary" onClick={() => navigate('/login')}>Fazer login</Button>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-4 grid gap-4 md:grid-cols-4">
        {/* Busca com autocomplete */}
        <div className="relative md:col-span-2">
          <Input
            placeholder="Buscar por nome ou código"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setSuggestionsOpen(true); }}
            onFocus={() => setSuggestionsOpen(true)}
            onBlur={() => setTimeout(() => setSuggestionsOpen(false), 150)}
          />
          {suggestionsOpen && searchTerm.trim().length > 0 && (
            <div className="absolute z-10 mt-1 w-full rounded border border-[#E5E7EB] bg-white shadow">
              {list.filter(p => p.nome.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.toLowerCase().includes(searchTerm.toLowerCase()))
                .slice(0, 5)
                .map(p => (
                  <button
                    key={p.id}
                    className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-gray-50"
                    onMouseDown={() => { setSearchTerm(p.nome); setSuggestionsOpen(false); }}
                  >
                    <span className="text-sm text-[#1F2937]">{p.nome}</span>
                    <span className="text-xs text-[#6B7280]">#{p.id}</span>
                  </button>
                ))}
            </div>
          )}
        </div>

        {/* Categoria multiselect */}
        <div>
          <div className="text-sm font-medium text-[#4B5563] mb-1">Categoria</div>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <label key={cat} className={`inline-flex items-center gap-2 rounded px-2 py-1 border ${selectedCategories.includes(cat) ? 'border-[#D22630] bg-[#D22630]/10' : 'border-[#E5E7EB]'}`}>
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={selectedCategories.includes(cat)}
                  onChange={(e) => {
                    setSelectedCategories(prev => e.target.checked ? [...prev, cat] : prev.filter(c => c !== cat));
                  }}
                />
                <span className="text-sm">{cat}</span>
              </label>
            ))}
            {categories.length === 0 && (
              <span className="text-sm text-[#6B7280]">Sem categorias</span>
            )}
          </div>
        </div>

        {/* Status */}
        <div>
          <div className="text-sm font-medium text-[#4B5563] mb-1">Status</div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={statusFilter.disponivel} onChange={(e) => setStatusFilter(s => ({ ...s, disponivel: e.target.checked }))} />
            Disponível
          </label>
          <label className="mt-2 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={statusFilter.esgotado} onChange={(e) => setStatusFilter(s => ({ ...s, esgotado: e.target.checked }))} />
            Esgotado
          </label>
        </div>

        {/* Preço range */}
        <div>
          <div className="text-sm font-medium text-[#4B5563] mb-1">Faixa de preço (R$)</div>
          <div className="flex items-center gap-2">
            <Input type="number" min={0} value={priceRange[0]} onChange={(e) => setPriceRange([Number(e.target.value || 0), priceRange[1]])} className="w-24" />
            <span className="text-[#6B7280]">—</span>
            <Input type="number" min={0} value={priceRange[1]} onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value || 0)])} className="w-24" />
          </div>
          <div className="mt-2 flex items-center gap-2">
            <input type="range" min={0} max={1000} step={10} value={priceRange[0]} onChange={(e) => setPriceRange([Number(e.target.value), Math.max(Number(e.target.value), priceRange[1])])} className="w-full" />
            <input type="range" min={0} max={1000} step={10} value={priceRange[1]} onChange={(e) => setPriceRange([Math.min(priceRange[0], Number(e.target.value)), Number(e.target.value)])} className="w-full" />
          </div>
        </div>
      </div>

      {/* Clear filters */}
      <div className="mb-4">
        <Button variant="outline" onClick={() => { setSearchTerm(""); setSelectedCategories([]); setStatusFilter({ disponivel: false, esgotado: false }); setPriceRange([0, 1000]); pagination.goToPage(1); }}>Limpar filtros</Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="animate-spin text-[#D22630]" size={32} />
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto rounded-md border border-[#E5E7EB] bg-white">
            <table className="w-full min-w-[800px]">
              <thead className="bg-[#F9FAFB]">
                <tr>
                  <th className="p-3 text-left text-sm text-[#4B5563] cursor-pointer" onClick={() => toggleSort('id')}>
                    Código
                    {sortBy === 'id' ? (sortDir === 'asc' ? <ArrowUp className="inline ml-2 h-4 w-4" /> : <ArrowDown className="inline ml-2 h-4 w-4" />) : <ArrowUpDown className="inline ml-2 h-4 w-4" />}
                  </th>
                  <th className="p-3 text-left text-sm text-[#4B5563] cursor-pointer" onClick={() => toggleSort('nome')}>
                    Nome
                    {sortBy === 'nome' ? (sortDir === 'asc' ? <ArrowUp className="inline ml-2 h-4 w-4" /> : <ArrowDown className="inline ml-2 h-4 w-4" />) : <ArrowUpDown className="inline ml-2 h-4 w-4" />}
                  </th>
                  <th className="p-3 text-left text-sm text-[#4B5563] cursor-pointer" onClick={() => toggleSort('estoque')}>
                    Quantidade
                    {sortBy === 'estoque' ? (sortDir === 'asc' ? <ArrowUp className="inline ml-2 h-4 w-4" /> : <ArrowDown className="inline ml-2 h-4 w-4" />) : <ArrowUpDown className="inline ml-2 h-4 w-4" />}
                  </th>
                  <th className="p-3 text-left text-sm text-[#4B5563] cursor-pointer" onClick={() => toggleSort('preco')}>
                    Preço Unitário
                    {sortBy === 'preco' ? (sortDir === 'asc' ? <ArrowUp className="inline ml-2 h-4 w-4" /> : <ArrowDown className="inline ml-2 h-4 w-4" />) : <ArrowUpDown className="inline ml-2 h-4 w-4" />}
                  </th>
                  <th className="p-3 text-left text-sm text-[#4B5563] cursor-pointer" onClick={() => toggleSort('status')}>
                    Status
                    {sortBy === 'status' ? (sortDir === 'asc' ? <ArrowUp className="inline ml-2 h-4 w-4" /> : <ArrowDown className="inline ml-2 h-4 w-4" />) : <ArrowUpDown className="inline ml-2 h-4 w-4" />}
                  </th>
                  <th className="p-3 text-right text-sm text-[#4B5563]">Ações</th>
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 ? (
                  <tr>
                    <td className="p-6 text-center text-[#4B5563]" colSpan={6}>Nenhum produto encontrado.</td>
                  </tr>
                ) : (
                  paged.map((p) => (
                    <tr key={p.id} className="border-t hover:bg-gray-50">
                      <td className="p-3 text-[#1F2937]">#{p.id}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          {p.imagem && (
                            <img src={p.imagem} alt={p.nome} className="h-10 w-10 rounded object-cover" />
                          )}
                          <div>
                            <div className="font-medium text-[#1F2937]">{p.nome.slice(0, 100)}</div>
                            {p.categoria && (
                              <div className="text-xs text-[#6B7280]">{p.categoria}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-[#1F2937]">
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min={0}
                            value={quantityEdits[p.id] ?? p.estoque}
                            onChange={(e) =>
                              setQuantityEdits((prev) => ({
                                ...prev,
                                [p.id]: Math.max(0, Number(e.target.value || 0)),
                              }))
                            }
                            onBlur={() => saveQuantity(p.id)}
                            onKeyDown={(e) => handleQtyKeyDown(e, p.id, p.estoque)}
                            className="w-24 h-9"
                          />
                          {savingQty[p.id] && <Loader2 className="h-4 w-4 animate-spin text-[#D22630]" />}
                        </div>
                      </td>
                      <td className="p-3 text-[#1F2937]">
                        {formatCurrency(Number(p.preco))}
                      </td>
                      <td className="p-3">
                        {(() => {
                          const isOut = p.estoque <= 0;
                          const isLow =
                            !isOut && marketing.enableLowStock && p.estoque <= marketing.lowStockThreshold;
                          const cls = isOut
                            ? "bg-red-100 text-red-700"
                            : isLow
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700";
                          const label = isOut
                            ? "Esgotado"
                            : isLow
                            ? marketing.lowStockMessage || "Últimas unidades!"
                            : "Disponível";
                          return (
                            <span
                              className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${cls}`}
                            >
                              {label}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          className="inline-flex items-center gap-1 text-[#2563EB] hover:underline mr-3"
                          onClick={() => { setSelectedProduct(p); setEditModalOpen(true); }}
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" /> Editar
                        </button>
                        <button
                          className="inline-flex items-center gap-1 text-[#DC2626] hover:underline"
                          onClick={() => setDeleteModal({ open: true, product: p })}
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" /> Excluir
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile List */}
          <div className="md:hidden space-y-3">
            {paged.map(p => (
              <div key={p.id} className="rounded border border-[#E5E7EB] bg-white p-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{p.nome.slice(0, 100)}</div>
                  {(() => {
                    const isOut = p.estoque <= 0;
                    const isLow = !isOut && marketing.enableLowStock && p.estoque <= marketing.lowStockThreshold;
                    const cls = isOut
                      ? 'bg-red-100 text-red-700'
                      : isLow
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-green-100 text-green-700';
                    const label = isOut ? 'Esgotado' : isLow ? (marketing.lowStockMessage || 'Últimas unidades!') : 'Disponível';
                    return <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${cls}`}>{label}</span>;
                  })()}
                </div>
                <div className="mt-2 text-sm text-[#6B7280]">ID: #{p.id}</div>
                <div className="mt-1 text-sm">Estoque: {p.estoque}</div>
                <div className="mt-1 text-sm">Preço: {formatCurrency(Number(p.preco))}</div>
                <div className="mt-2 flex justify-end gap-3">
                  <button className="inline-flex items-center gap-1 text-[#2563EB]" onClick={() => { setSelectedProduct(p); setEditModalOpen(true); }}>
                    <Pencil className="h-4 w-4" /> Editar
                  </button>
                  <button className="inline-flex items-center gap-1 text-[#DC2626]" onClick={() => setDeleteModal({ open: true, product: p })}>
                    <Trash2 className="h-4 w-4" /> Excluir
                  </button>
                </div>
              </div>
            ))}
            {paged.length === 0 && (
              <div className="text-center text-[#6B7280]">Nenhum produto encontrado.</div>
            )}
          </div>

          {/* Pagination Controls */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-[#6B7280]">
              Mostrando {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, sorted.length)} de {sorted.length}
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-[#6B7280]">Por página</label>
              <select
                className="h-9 rounded border border-[#E5E7EB] bg-white px-2 text-sm"
                value={pagination.limit}
                onChange={(e) => pagination.setLimit(Number(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <Button variant="outline" onClick={pagination.previousPage} disabled={!pagination.hasPreviousPage}>Anterior</Button>
              <Button variant="outline" onClick={pagination.nextPage} disabled={!pagination.hasNextPage}>Próximo</Button>
            </div>
          </div>
        </>
      )}

      {/* Create Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 bg-black/30">
            <div className="w-full max-w-5xl rounded-lg border border-[#E5E7EB] bg-white shadow-xl">
              <div className="border-b border-[#E5E7EB] px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-[#1F2937]">Novo Produto</h2>
                <button onClick={() => !submitting && setModalOpen(false)} aria-label="Fechar" disabled={submitting} className="text-[#6B7280] hover:text-[#1F2937] disabled:opacity-50">
                  <X size={24} />
                </button>
              </div>
              <div className="p-6">
                <ProductForm onSubmit={handleCreate} onCancel={() => setModalOpen(false)} submitLabel="Criar Produto" isLoading={submitting} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 bg-black/30">
            <div className="w-full max-w-5xl rounded-lg border border-[#E5E7EB] bg-white shadow-xl">
              <div className="border-b border-[#E5E7EB] px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-[#1F2937]">Editar Produto</h2>
                <button onClick={() => !submitting && setEditModalOpen(false)} aria-label="Fechar" disabled={submitting} className="text-[#6B7280] hover:text-[#1F2937] disabled:opacity-50">
                  <X size={24} />
                </button>
              </div>
              <div className="p-6">
                <ProductForm initialData={{
                  nome: selectedProduct.nome,
                  descricao: selectedProduct.descricao,
                  preco: Number(selectedProduct.preco),
                  imagem: selectedProduct.imagem || "",
                  estoque: selectedProduct.estoque,
                  categoria: selectedProduct.categoria,
                  ativo: selectedProduct.estoque > 0 ? selectedProduct.ativo : false,
                  promo_tag: selectedProduct.promo_tag ?? false,
                  bestseller_tag: selectedProduct.bestseller_tag ?? false,
                  new_tag: selectedProduct.new_tag ?? false,
                }} onSubmit={handleUpdate} onCancel={() => setEditModalOpen(false)} submitLabel="Salvar Alterações" isLoading={submitting} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.open && deleteModal.product && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 bg-black/30">
            <div className="w-full max-w-lg rounded-lg border border-[#E5E7EB] bg-white shadow-xl">
              <div className="px-6 py-4">
                <h2 className="text-lg font-semibold text-[#1F2937]">Confirmar exclusão</h2>
                <p className="mt-2 text-sm text-[#4B5563]">Deseja realmente excluir {deleteModal.product.nome}?</p>
              </div>
              <div className="px-6 py-4 flex justify-end gap-3 border-t border-[#E5E7EB]">
                <Button variant="outline" onClick={() => setDeleteModal({ open: false })}>Cancelar</Button>
                <Button variant="primary" onClick={async () => { await handleDelete(deleteModal.product!.id); setDeleteModal({ open: false }); }}>Confirmar</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
