import { computeOriginForEnvironment } from '@lib/csp/ComputeOriginForEnvironment';
import { AuthorisedOrigins, CspPolicies } from '@lib/csp/CspDirectives';
import { computeHeaderNameByReportType, ReportType } from '@lib/csp/CspHeaders';
import { NoncesConfiguration } from '@lib/plugins/CspProxyPlugin';
import * as crypto from 'node:crypto';
import * as http from 'node:http';
import { Connect, ViteDevServer } from 'vite';

/**
 * Generates a cryptographically secure random nonce value for CSP.
 *
 * @returns {string} A Base64 encoded random nonce value.
 */
export const generateNonce = (): string => {
  return crypto.randomBytes(16).toString('base64');
};

/**
 * Replaces the nonce placeholder in a string with a generated nonceValue value.
 *
 * @param initialValue base value to search placeholder in
 * @param placeholder placeholder of the nonce value that will be replaced by the real nonce value
 * @param {string} nonceValue - The nonceValue value to replace the placeholder with.
 * @returns {string} The string with placeholder replaced by the nonceValue.
 */
export const replaceNoncePlaceholder = (
  initialValue: string,
  placeholder: string,
  nonceValue: string,
): string => {
  return initialValue.replace(placeholder, `${nonceValue}`);
};

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
 * @param developmentKey the key of the development environment if it exists
 * @returns {string} The computed CSP directive string.
 */
export const computeDirectivesForDevelopmentEnvironment = <Environment extends string = never>(
  policies: CspPolicies,
  developmentKey?: Environment,
): string => {
  console.log(policies);

  return Object.entries(policies).reduce(
    (rules: string, [directive, value]: [string, AuthorisedOrigins<Environment>]) => {
      const allowedOrigin: string = computeOriginForEnvironment(value, developmentKey);
      return `${rules}${directive} ${allowedOrigin}; `;
    },
    '',
  );
};

/**
 * Replace in base directive the template used for nonce by the generated nonce
 * The value will not
 * @param rules
 * @param nonceValue
 * @param noncePlaceholder
 * @param developmentKey the key of the development environment if it exists
 */
const computeRulesWithNonce = <Environment extends string = never>(
  rules: CspPolicies<Environment>,
  nonceValue: string,
  noncePlaceholder: string,
  developmentKey?: Environment,
): CspPolicies<Environment> => {
  const nonceToReplace: string = `'nonce-${noncePlaceholder}'`;

  return Object.fromEntries(
    Object.entries(rules).map(([directive, value]: [string, AuthorisedOrigins<Environment>]) => {
      // Replace nonce template in CSP if it is common for every environment (type equals string)
      if (typeof value === 'string' && value.includes(nonceToReplace)) {
        return [directive, replaceNoncePlaceholder(value, noncePlaceholder, nonceValue)];
      }

      // Replace nonce template in CSP if it is configured for development (developmentKey exists in object)
      if (typeof value === 'object' && developmentKey && value[developmentKey] && value[developmentKey].includes(nonceToReplace)) {
        return [
          directive,
          {
            ...value,
            [developmentKey]: replaceNoncePlaceholder(value[developmentKey], noncePlaceholder, nonceValue),
          },
        ];
      }

      // Replace nonce template in CSP for the default CSP
      if (typeof value === 'object' && value.default && value.default.includes(nonceToReplace)) {
        return [
          directive,
          {
            ...value,
            default: replaceNoncePlaceholder(value.default, noncePlaceholder, nonceValue),
          },
        ];
      }

      return [directive, value];
    }),
  );
};

/**
 * Configures a proxy server to apply Content Security Policies (CSP) headers.
 *
 * This function sets up middleware that generates a random nonce for each request,
 * replaces any placeholders in CSP directives with this nonce,
 * and sets the appropriate CSP headers on the response.
 *
 * @param server The Vite development server instance used to monitor file changes and handle dynamic updates.
 * @param rules The CSP policies or rules to apply for file generation across the specified environments.
 * @param nonce Nonce value to use for the request
 * @param reportType Optional parameter to specify the type of CSP report to generate.
 * @param noncesConfiguration The nonce configuration
 */
export function configureCspProxyServer<Environment extends string = never>(
  server: ViteDevServer,
  rules: CspPolicies,
  nonce: string,
  reportType?: ReportType,
  noncesConfiguration?: NoncesConfiguration<Environment>,
) {
  server.middlewares.use((
    _: Connect.IncomingMessage,
    response: http.ServerResponse<Connect.IncomingMessage>,
    next: Connect.NextFunction,
  ) => {
    if (!!noncesConfiguration) {
      // Store the nonce in the response locals for potential use in HTML templates
      // @ts-expect-error - Adding custom property to response
      response.locals = response.locals || {};
      // @ts-expect-error - Adding custom property to response
      response.locals.cspNonce = nonce;
    }

    // Process the rules to replace the nonce placeholder  placeholders with the generated nonce if template is provided
    const directives: string = computeDirectivesForDevelopmentEnvironment(
      !!noncesConfiguration
        ? computeRulesWithNonce(rules, nonce, noncesConfiguration.nonceTemplate)
        : rules,
      noncesConfiguration?.developmentKey,
    );

    const cspHeader: string = computeHeaderNameByReportType(reportType);
    response.setHeader(cspHeader, directives);

    next();
  });
}
