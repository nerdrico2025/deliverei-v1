import { describe, it, expect } from 'vitest';
import { storefrontSupabase } from '../services/storefrontSupabase';

describe('storefrontSupabase integration', () => {
  it('lists active products for pizza-express', async () => {
    const items = await storefrontSupabase.getProdutos('pizza-express', { page: 1, limit: 100 });
    expect(Array.isArray(items)).toBe(true);
    // Should have at least one product according to provided schema/data
    expect(items.length).toBeGreaterThan(0);
    // Validate required fields mapping
    const p = items[0];
    expect(p.id).toBeTruthy();
    expect(typeof p.preco).toBe('number');
    expect(p.disponivel).toBe(true);
  });
});
