import {
  computeConfigurationFileContent,
} from '@lib/csp-configuration-generation/CspConfigurationFileGeneration';
import { describe, expect, it } from 'vitest';

describe('computeConfigurationFileContent', () => {
  it('should generate correct configuration for basic inputs', () => {
    const headerName: string = 'Content-Security-Policy';
    const directive: string = 'default-src \'self\'';

    const result: string = computeConfigurationFileContent(headerName, directive);

    const expected: string = `# Nginx configuration
add_header Content-Security-Policy "default-src 'self'";

# Apache configuration
Header set Content-Security-Policy "default-src 'self'"
`;
    expect(result).toBe(expected);
  });

  it('should generate correct configuration for complex directives', () => {
    const headerName: string = 'Content-Security-Policy';
    const directive: string = 'default-src \'self\'; script-src \'self\' \'unsafe-inline\' https://example.com; style-src \'self\' \'unsafe-inline\'';

    const result: string = computeConfigurationFileContent(headerName, directive);

    const expected: string = `# Nginx configuration
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://example.com; style-src 'self' 'unsafe-inline'";

# Apache configuration
Header set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://example.com; style-src 'self' 'unsafe-inline'"
`;
    expect(result).toBe(expected);
  });

  it('should generate correct configuration for report-only header', () => {
    const headerName: string = 'Content-Security-Policy-Report-Only';
    const directive: string = 'default-src \'self\'; report-uri https://example.com/report';

    const result: string = computeConfigurationFileContent(headerName, directive);

    const expected: string = `# Nginx configuration
add_header Content-Security-Policy-Report-Only "default-src 'self'; report-uri https://example.com/report";

# Apache configuration
Header set Content-Security-Policy-Report-Only "default-src 'self'; report-uri https://example.com/report"
`;
    expect(result).toBe(expected);
  });
});
