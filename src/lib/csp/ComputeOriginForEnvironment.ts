import { AuthorisedOrigins, CspPolicies } from '@lib/csp/CspDirectives';

/**
 * Computes and returns the origin for a specific environment based on the provided configuration.
 *
 * @template Environment - A generic type representing the environment type. Defaults to `never` if unspecified.
 * @param {AuthorisedOrigins<Environment>} origine - The authorized origins configuration, which can either be a string or an object mapping environments to specific origins.
 * @param {Environment} environment - The current environment for which the origin should be determined.
 * @returns {string} - The resolved origin for the specified environment. If no specific origin is found for the environment, the default origine is returned.
 */
export const computeOriginForEnvironment = <Environment extends string = never>(
  origine: AuthorisedOrigins<Environment>,
  environment?: Environment,
): string => {
  if (typeof origine === 'string') {
    return origine;
  }

  return origine[environment] ?? origine.default;
};

/**
 * Generates a Content Security Policy (CSP) directive string based on provided
 * policies and the specified environment.
 *
 * @template Environment - The type representing the environment. Defaults to `never`.
 * @param {CspPolicies<Environment>} policies - An object defining CSP policies, mapping
 *                                               directives to their respective authorized origins.
 * @param {Environment} environment - The current environment for which the CSP directives should
 *                                     be computed.
 * @returns {string} The resulting CSP directive.
 */
export const computeCspDirectiveForEnvironment = <Environment extends string = never>(
  policies: CspPolicies<Environment>,
  environment?: Environment,
): string => {
  return Object
    .entries(policies)
    .map(([directive, value]: [string, AuthorisedOrigins<Environment>]) => {
      const allowedOrigin: string = computeOriginForEnvironment(value, environment);
      return `${directive} ${allowedOrigin}`;
    })
    .join('; ');
};
