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
    cspProxyPlugin({
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
environments that can be used with Nginx or Apache servers.

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
      // Optional: Custom path for the generated configuration files
      cspConfigurationFilePath: 'custom/path/csp-configuration.ts',
    }),
  ],
});
```

The plugin will generate configuration files in the `content-security-policy/configurations/`
directory with names like `csp-configuration.production.txt`, `csp-configuration.staging.txt`, etc.

Each file will contain configuration for both Nginx and Apache servers:

```
# Nginx configuration
add_header Content-Security-Policy "default-src 'self'; script-src 'self' https://production.example.com; style-src 'self'; img-src 'self' data:; connect-src 'self' https://api.production.example.com";

# Apache configuration
Header set Content-Security-Policy "default-src 'self'; script-src 'self' https://production.example.com; style-src 'self'; img-src 'self' data:; connect-src 'self' https://api.production.example.com"
```
> Note : You can move the rules to `/<root>/content-security-policy/csp-configuration.ts` for automatic file generation when the file changes

## Advanced Configuration

### Report-Only Mode

You can use report-only mode to monitor CSP violations without blocking content:

```typescript
cspProxyPlugin({
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

Configuration files will be generated when this file (or when vite.config.ts) changes
