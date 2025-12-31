import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import * as Sentry from '@sentry/react';
import ErrorBoundary from '../components/common/ErrorBoundary';

vi.spyOn(Sentry, 'captureException').mockImplementation(() => {});

function Boom() {
  throw new Error('boom');
}

describe('ErrorBoundary', () => {
  it('renderiza fallback ao capturar erro e envia ao Sentry', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>
    );
    expect(getByText('Ops! Algo deu errado')).toBeTruthy();
    expect(Sentry.captureException).toHaveBeenCalled();
  });
});
