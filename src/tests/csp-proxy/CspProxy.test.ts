import { describe, it, expect } from 'vitest';
import { computeDevelopmentDirective } from '@lib/csp-proxy/CspProxy';
import { CspPolicies } from '@lib/csp/CspDirectives';

type Environment = 'production' | 'staging';

describe('computeDevelopmentDirective', () => {
  it('should compute development directive with string values', () => {
    const policies: CspPolicies<Environment> = {
      'default-src': '\'self\'',
      'script-src': '\'self\' \'unsafe-inline\'',
      'style-src': '\'self\' \'unsafe-inline\'',
    };

    const result: string = computeDevelopmentDirective(policies);

    expect(result).toBe('default-src \'self\';script-src \'self\' \'unsafe-inline\';style-src \'self\' \'unsafe-inline\';');
  });

  it('should compute development directive with object values using default property', () => {
    const policies: CspPolicies<Environment> = {
      'default-src': {
        default: '\'self\'',
        production: '\'self\' https://production.example.com',
      },
      'script-src': {
        default: '\'self\' \'unsafe-inline\'',
        production: '\'self\' \'unsafe-inline\' https://production.example.com',
      },
    };

    const result: string = computeDevelopmentDirective(policies);

    expect(result).toBe('default-src \'self\';script-src \'self\' \'unsafe-inline\';');
  });

  it('should compute development directive with mixed string and object values', () => {
    const policies: CspPolicies<Environment> = {
      'default-src': '\'self\'',
      'script-src': {
        default: '\'self\' \'unsafe-inline\'',
        production: '\'self\' \'unsafe-inline\' https://production.example.com',
      },
    };

    const result: string = computeDevelopmentDirective(policies);

    expect(result).toBe('default-src \'self\';script-src \'self\' \'unsafe-inline\';');
  });

  it('should return empty string for empty policies', () => {
    const policies: CspPolicies<Environment> = {};

    const result: string = computeDevelopmentDirective(policies);

    expect(result).toBe('');
  });
});
