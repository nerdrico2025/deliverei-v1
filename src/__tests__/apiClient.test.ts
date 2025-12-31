import { describe, it, expect } from 'vitest';
import apiClient from '../services/apiClient';

describe('apiClient configuration', () => {
  it('uses 60s timeout to resist cold starts', () => {
    expect(apiClient.defaults.timeout).toBe(60000);
  });
});
