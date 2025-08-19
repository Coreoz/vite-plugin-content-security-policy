import {
  computeOriginForEnvironment
} from '@lib/csp/ComputeOriginForEnvironment';
import { describe, it, expect } from 'vitest';
import {
  computeCspDirectiveForEnvironment,
} from '@lib/csp-configuration-generation/CspConfigurationFileGeneration';
import { AuthorisedOrigins, CspPolicies } from '@lib/csp/CspDirectives';

type Environment = 'production' | 'staging';

describe('computeOriginForEnvironment', () => {
  it('should return the value directly if it is a string', () => {
    const value: string = '\'self\'';
    const environment: 'production' = 'production';

    const result: string = computeOriginForEnvironment(value, environment);

    expect(result).toBe('\'self\'');
  });

  it('should return the environment-specific value if available', () => {
    const value: AuthorisedOrigins<Environment> = {
      default: '\'self\'',
      production: '\'self\' https://production.example.com',
      staging: '\'self\' https://staging.example.com',
    };
    const environment: 'production' = 'production';

    const result: string = computeOriginForEnvironment(value, environment);

    expect(result).toBe('\'self\' https://production.example.com');
  });

  it('should return the default value if environment-specific value is not available', () => {
    const value: AuthorisedOrigins<Environment> = {
      default: '\'self\'',
      staging: '\'self\' https://staging.example.com',
    };
    const environment: 'production' = 'production';

    const result: string = computeOriginForEnvironment(value, environment);

    expect(result).toBe('\'self\'');
  });
});

describe('computeCspDirectiveForEnvironment', () => {
  it('should compute CSP directive for environment with string values', () => {
    const policies: CspPolicies<'production'> = {
      'default-src': '\'self\'',
      'script-src': '\'self\' \'unsafe-inline\'',
      'style-src': '\'self\' \'unsafe-inline\'',
    };
    const environment: 'production' = 'production';

    const result: string = computeCspDirectiveForEnvironment(policies, environment);

    expect(result).toBe('default-src \'self\'; script-src \'self\' \'unsafe-inline\'; style-src \'self\' \'unsafe-inline\'');
  });

  it('should compute CSP directive for environment with object values', () => {
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
    const environment: 'production' = 'production';

    const result: string = computeCspDirectiveForEnvironment(policies, environment);

    expect(result).toBe('default-src \'self\' https://production.example.com; script-src \'self\' \'unsafe-inline\' https://production.example.com');
  });

  it('should compute CSP directive for environment with mixed string and object values', () => {
    const policies: CspPolicies<Environment> = {
      'default-src': '\'self\'',
      'script-src': {
        default: '\'self\' \'unsafe-inline\'',
        production: '\'self\' \'unsafe-inline\' https://production.example.com',
      },
    };
    const environment: 'production' = 'production';

    const result: string = computeCspDirectiveForEnvironment(policies, environment);

    expect(result).toBe('default-src \'self\'; script-src \'self\' \'unsafe-inline\' https://production.example.com');
  });

  it('should compute CSP directive for environment with fallback to default values', () => {
    const policies: CspPolicies<Environment> = {
      'default-src': {
        default: '\'self\'',
      },
      'script-src': {
        default: '\'self\' \'unsafe-inline\'',
        staging: '\'self\' \'unsafe-inline\' https://staging.example.com',
      },
    };
    const environment: 'production' = 'production';

    const result: string = computeCspDirectiveForEnvironment(policies, environment);

    expect(result).toBe('default-src \'self\'; script-src \'self\' \'unsafe-inline\'');
  });
});
