import { generateNonce, replaceNoncePlaceholder } from '@lib/csp-proxy/CspProxy';
import { computeCspDirectiveForEnvironment } from '@lib/csp/ComputeOriginForEnvironment';
import { CspPolicies } from '@lib/csp/CspDirectives';
import { describe, expect, it } from 'vitest';

const noncePlaceholder: string = '{RANDOM}';

type Environment = 'production' | 'staging';

describe('generateNonce', () => {
  it('should generate a random base64 string', () => {
    const nonce: string = generateNonce();

    // Check that the nonce is a non-empty string
    expect(nonce).toBeDefined();
    expect(typeof nonce).toBe('string');
    expect(nonce.length).toBe(24);

    // Check that it's a valid base64 string
    const base64Regex: RegExp = /^[A-Za-z0-9+/=]+$/;
    expect(base64Regex.test(nonce)).toBe(true);
  });

  it('should generate different nonces on each call', () => {
    const nonce1: string = generateNonce();
    const nonce2: string = generateNonce();

    expect(nonce1).not.toBe(nonce2);
  });
});

describe('replaceRandomPlaceholder', () => {
  it('should replace {RANDOM} with the provided nonce', () => {
    const value: string = '\'self\' \'unsafe-inline\' nonce-{RANDOM}';
    const nonce: string = 'test-nonce-value';

    const result: string = replaceNoncePlaceholder(value, noncePlaceholder, nonce);

    expect(result).toBe('\'self\' \'unsafe-inline\' nonce-test-nonce-value');
  });

  it('should not modify strings without the placeholder', () => {
    const value: string = '\'self\' \'unsafe-inline\'';
    const nonce: string = 'test-nonce-value';

    const result: string = replaceNoncePlaceholder(value, noncePlaceholder, nonce);

    expect(result).toBe('\'self\' \'unsafe-inline\'');
  });

  it('should replace multiple occurrences of the placeholder', () => {
    const value: string = 'nonce-{RANDOM} \'self\' nonce-{RANDOM}';
    const nonce: string = 'test-nonce-value';

    const result: string = replaceNoncePlaceholder(value, noncePlaceholder, nonce);

    expect(result).toBe('nonce-test-nonce-value \'self\' nonce-test-nonce-value');
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

    const result: string = computeCspDirectiveForEnvironment<Environment>(policies, environment);

    expect(result).toBe('default-src \'self\'; script-src \'self\' \'unsafe-inline\'; style-src \'self\' \'unsafe-inline\'');
  });

  it('should compute CSP directive for environment with object values', () => {
    const policies: CspPolicies<Environment> = {
      'default-src': {
        default: '\'self\'',
        production: '\'self\' https://production.default.com',
      },
      'script-src': {
        default: '\'self\' \'unsafe-inline\'',
        production: '\'self\' \'unsafe-inline\' https://production.script.com',
      },
    };
    const environment: 'production' = 'production';

    const result: string = computeCspDirectiveForEnvironment<Environment>(policies, environment);

    expect(result).toBe('default-src \'self\' https://production.default.com; script-src \'self\' \'unsafe-inline\' https://production.script.com');
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

    const result: string = computeCspDirectiveForEnvironment<Environment>(policies, environment);

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

    const result: string = computeCspDirectiveForEnvironment<Environment>(policies, environment);

    expect(result).toBe('default-src \'self\'; script-src \'self\' \'unsafe-inline\'');
  });
});
