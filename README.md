# Vite Plugin Content Security Policy

A Vite plugin for managing Content Security Policy (CSP) headers during development and generating
Apache/Nginx configuration files for production environments.

## Features

This library provides two Vite plugins to help you manage Content Security Policy (CSP) in your web
applications:

1. **CSP Proxy Plugin**: Adds CSP headers to responses during development, allowing you to test your
   application with CSP restrictions in place.
2. **CSP Configuration File Generation Plugin**: Generates CSP configuration files for different
   environments (production, staging, etc.) that can be used with Nginx or Apache servers.

## Installation

```bash
# npm
npm install vite-plugin-content-security-policy --save-dev

# yarn
yarn add vite-plugin-content-security-policy --dev

# pnpm
pnpm add vite-plugin-content-security-policy -D
```

## Usage

### CSP Proxy Plugin

The CSP Proxy Plugin adds Content Security Policy headers to responses during development, allowing
you to test your application with CSP restrictions in place.

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { cspProxyPlugin } from 'vite-plugin-content-security-policy';

export default defineConfig({
  plugins: [
    cspProxyPlugin<Environment>{
      rules: {
        'default-src': "'self'",
        'script-src': "'self'",
        'style-src': "'self'",
        'img-src': "'self' data:",
        'connect-src': "'self' https://api.example.com",
      },
      // Optional: Use 'report' for report-only mode, 'strict' for enforcement (default)
      reportType: 'strict',
    }),
  ],
});
```

### CSP Configuration File Generation Plugin

The CSP Configuration File Generation Plugin generates CSP configuration files for different
environments that can be used with Nginx or Apache servers. File will be generated when the server starts.

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { cspConfigurationFileGenerationPlugin } from 'vite-plugin-content-security-policy';

// Define your environments
type Environment = 'production' | 'staging' | 'development';

export default defineConfig({
  plugins: [
    cspConfigurationFileGenerationPlugin<Environment>({
      rules: {
        'default-src': "'self'",
        'script-src': {
          default: "'self'",
          production: "'self' https://production.example.com",
          staging: "'self' https://staging.example.com",
        },
        'style-src': "'self'",
        'img-src': "'self' data:",
        'connect-src': {
          default: "'self'",
          production: "'self' https://api.production.example.com",
          staging: "'self' https://api.staging.example.com",
        },
      },
      environments: new Set(['production', 'staging', 'preproduction']),
      // Optional: Use 'report' for report-only mode, 'strict' for enforcement (default)
      reportType: 'strict',
      // Optional: Custom path for the CSP configuration file relatively to the root of the project
      cspConfigurationFilePath: 'custom/path/csp-configuration.ts',
    }),
  ],
});
```

The plugin will generate configuration files in the `/content-security-policy/configurations`
directory with names like `csp-configuration.production.txt`, `csp-configuration.staging.txt`, etc.

Each file will contain configuration for both Nginx and Apache servers:

```
# Nginx configuration
add_header Content-Security-Policy "default-src 'self'; script-src 'self' https://production.example.com; style-src 'self'; img-src 'self' data:; connect-src 'self' https://api.production.example.com";

# Apache configuration
Header set Content-Security-Policy "default-src 'self'; script-src 'self' https://production.example.com; style-src 'self'; img-src 'self' data:; connect-src 'self' https://api.production.example.com"
```
> Note : File will be generated if vite.config.ts or if `/<root>/content-security-policy/csp-configuration.ts` change

## Advanced Configuration

### Report-Only Mode

You can use report-only mode to monitor CSP violations without blocking content:

```typescript
cspProxyPlugin<Environment>{
  rules: {
    // Your CSP rules
  },
  reportType: 'report',
})
```

This will use the `Content-Security-Policy-Report-Only` header instead of `Content-Security-Policy`.

### Custom Configuration File Path

You can specify a custom path for the generated configuration files:

```typescript
cspConfigurationFileGenerationPlugin({
  // Your CSP rules and environments
  cspConfigurationFilePath: 'custom/path/csp-configuration.ts',
})
```

Configuration files will be generated when this file (or when vite.config.ts) changes.

### Using Nonces with CSP

You can use nonces with CSP to allow specific inline scripts and styles. The plugin supports replacing a `{RANDOM}` placeholder with a generated nonce:

1. Configure `html.cspNonce` in your Vite config:

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { cspProxyPlugin } from 'vite-plugin-content-security-policy';

export default defineConfig({
  plugins: [
    cspProxyPlugin<Environment>{
      rules: {
        'default-src': "'self'",
        'script-src': "'self' 'unsafe-inline' nonce-{RANDOM}",
        'style-src': "'self' 'unsafe-inline' nonce-{RANDOM}",
      },
      noncesConfiguration: {
        template: '{RANDOM}', 
        developmentKey: 'dev'
      }
    }),
  ],
  html: {
    cspNonce: '{RANDOM}',
  },
});
```

2. The plugin will:
   - Generate a cryptographically secure random nonce
   - Replace the `html.cspNonce` from the vite.config.ts with the generated nonce
   - Replace `nonce-{RANDOM}` in CSP rules with `nonce-[generated-nonce]`

> ⚠️ `html.cspNonce` from the vite.config.ts will be overridden by the plugin in development mode

This ensures that the same nonce is used for both the CSP headers and the HTML attributes, allowing specific inline scripts and styles to be executed while maintaining security.

## Resources

See [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy#directives) for more information about CSP