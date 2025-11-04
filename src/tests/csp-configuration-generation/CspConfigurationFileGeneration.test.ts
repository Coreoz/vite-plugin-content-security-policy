import { computeOriginForEnvironment } from '@lib/csp/ComputeOriginForEnvironment';
import { AuthorisedOrigins } from '@lib/csp/CspDirectives';
import { describe, expect, it } from 'vitest';

type Environment = 'production' | 'staging';

describe('computeOriginForEnvironment', () => {
  it('should return the value directly if it is a string', () => {
    const value: string = '\'self\'';
    const environment: 'production' = 'production';

    const result: string = computeOriginForEnvironment<Environment>(value, environment);

    expect(result).toBe('\'self\'');
  });

  it('should return the environment-specific value if available', () => {
    const value: AuthorisedOrigins<Environment> = {
      default: '\'self\'',
      production: '\'self\' https://production.example.com',
      staging: '\'self\' https://staging.example.com',
    };
    const environment: 'production' = 'production';

    const result: string = computeOriginForEnvironment<Environment>(value, environment);

    expect(result).toBe('\'self\' https://production.example.com');
  });

  it('should return the default value if environment-specific value is not available', () => {
    const value: AuthorisedOrigins<Environment> = {
      default: '\'self\'',
      staging: '\'self\' https://staging.example.com',
    };
    const environment: 'production' = 'production';

    const result: string = computeOriginForEnvironment<Environment>(value, environment);

    expect(result).toBe('\'self\'');
  });
});
