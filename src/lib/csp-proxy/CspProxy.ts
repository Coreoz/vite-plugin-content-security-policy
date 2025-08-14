import { AuthorisedOrigins, CspPolicies } from '@lib/csp/CspDirectives';
import { computeHeaderNameByReportType, ReportType } from '@lib/csp/CspHeaders';
import * as http from 'node:http';
import { Connect, ViteDevServer } from 'vite';

/**
 * Computes a Content Security Policy (CSP) directive string based on the given policies object.
 *
 * This function iterates through the provided policies object, where each property represents a CSP directive
 * and its corresponding allowed origins. It constructs a directive string in the format:
 * `directive allowedOrigin;`.
 *
 * The `allowedOrigin` is determined based on the type of the value in the policies object. If the value is
 * a string, it is directly used as the allowed origin. If the value is an object containing a `default` property,
 * the value of the `default` property is used.
 *
 * @param {CspPolicies} policies - An object representing the CSP policies where each key is a directive name
 *                                 and the value represents the allowed origins for that directive.
 * @returns {string} The computed CSP directive string.
 */
export const computeDevelopmentDirective = (policies: CspPolicies): string => {
  return Object.entries(policies).reduce(
    (rules: string, [directive, value]: [string, AuthorisedOrigins]) => {
      const allowedOrigin: string = typeof value === 'string' ? value : value.default;
      return `${rules}${directive} ${allowedOrigin};`;
    },
    '',
  );
};

/**
 * Configures a proxy server to apply Content Security Policies (CSP) headers.
 *
 * @param server The Vite development server instance used to monitor file changes and handle dynamic updates.
 * @param rules The CSP policies or rules to apply for file generation across the specified environments.
 * @param reportType Optional parameter to specify the type of CSP report to generate.
 */
export function configureCspProxyServer(
  server: ViteDevServer,
  rules: CspPolicies,
  reportType?: ReportType,
) {
  server.middlewares.use((
    _: Connect.IncomingMessage,
    response: http.ServerResponse<Connect.IncomingMessage>,
    next: Connect.NextFunction,
  ) => {
    const cspHeader: string = computeHeaderNameByReportType(reportType);

    const directives: string = computeDevelopmentDirective(rules);

    response.setHeader(cspHeader, directives);

    next();
  });
}
