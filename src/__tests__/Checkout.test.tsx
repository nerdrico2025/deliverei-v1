import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import Checkout from '../pages/storefront/Checkout';
import * as backendApi from '../services/backendApi';

vi.spyOn(backendApi, 'carrinhoApi', 'get').mockReturnValue({
  checkout: vi.fn().mockResolvedValue({ pedidoId: 'PED-1', status: 'PENDENTE', total: 10 }),
} as any);

describe('Checkout', () => {
  it('envia checkout ao backend', async () => {
    const { getByText } = render(<Checkout />);
    const btn = getByText('Finalizar pedido');
    fireEvent.click(btn);
    expect(backendApi.carrinhoApi.checkout).toHaveBeenCalledTimes(1);
  });
});
