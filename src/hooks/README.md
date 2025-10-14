
# Custom Hooks

Esta pasta contém hooks customizados reutilizáveis para simplificar lógica comum em componentes React.

## Hooks Disponíveis

### `useApi` e `useApiEffect`

Hook para gerenciar chamadas de API com loading e error state.

**Uso:**
```typescript
import { useApi, useApiEffect } from '@/hooks';

// Execução manual
const { data, loading, error, execute } = useApi<User[]>();

useEffect(() => {
  execute(() => userApi.getAll());
}, []);

// Execução automática
const { data, loading, error, refetch } = useApiEffect(
  () => userApi.getAll(),
  []
);
```

### `usePagination`

Hook para gerenciamento de paginação.

**Uso:**
```typescript
import { usePagination } from '@/hooks';

const pagination = usePagination(1, 10);

const fetchData = async () => {
  const result = await api.list({ 
    page: pagination.page, 
    limit: pagination.limit 
  });
  pagination.setTotal(result.total);
};

// Controles disponíveis
pagination.nextPage();
pagination.previousPage();
pagination.goToPage(5);
```

### `useDebounce` e `useDebouncedCallback`

Hook para debounce de valores e callbacks.

**Uso:**
```typescript
import { useDebounce, useDebouncedCallback } from '@/hooks';

// Debounce de valor
const [searchTerm, setSearchTerm] = useState('');
const debouncedSearchTerm = useDebounce(searchTerm, 500);

useEffect(() => {
  searchApi(debouncedSearchTerm);
}, [debouncedSearchTerm]);

// Debounce de callback
const debouncedSearch = useDebouncedCallback(
  (term: string) => searchApi(term),
  500
);
```

### `useForm`

Hook para gerenciamento de formulários com validação.

**Uso:**
```typescript
import { useForm } from '@/hooks';

interface LoginForm {
  email: string;
  password: string;
}

const form = useForm<LoginForm>({
  initialValues: { email: '', password: '' },
  validate: (values) => {
    const errors = {};
    if (!values.email) errors.email = 'Email é obrigatório';
    return errors;
  },
  onSubmit: async (values) => {
    await loginApi(values);
  }
});

// No JSX
<form onSubmit={form.handleSubmit}>
  <input 
    value={form.values.email}
    onChange={form.handleChange('email')}
    onBlur={form.handleBlur('email')}
  />
  {form.errors.email && form.touched.email && (
    <span>{form.errors.email}</span>
  )}
</form>
```

### `useCart`

Hook para gerenciamento do carrinho de compras.

**Uso:**
```typescript
import { useCart } from '@/hooks';

const cart = useCart();

// Adicionar item
cart.add({ id: '1', title: 'Pizza', price: 35.9 }, 1);

// Atualizar quantidade
cart.updateQty('1', 2);

// Remover item
cart.remove('1');

// Limpar carrinho
cart.clear();

// Acessar dados
console.log(cart.items);
console.log(cart.count);
console.log(cart.subtotal);
```

## Organização

- Cada hook está em seu próprio arquivo
- `index.ts` exporta todos os hooks (barrel export)
- Todos os hooks são documentados com JSDoc
- Exemplos de uso incluídos em cada hook

## Benefícios

✅ Redução de código duplicado  
✅ Lógica reutilizável e testável  
✅ Melhor organização do código  
✅ Facilita manutenção  
✅ Type-safe com TypeScript

