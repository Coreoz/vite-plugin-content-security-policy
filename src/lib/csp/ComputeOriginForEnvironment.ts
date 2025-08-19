import { AuthorisedOrigins } from '@lib/csp/CspDirectives';

/**
 * Computes and returns the origin for a specific environment based on the provided configuration.
 *
 * @template Environment - A generic type representing the environment type. Defaults to `never` if unspecified.
 * @param {AuthorisedOrigins<Environment>} origine - The authorized origins configuration, which can either be a string or an object mapping environments to specific origins.
 * @param {Environment} environment - The current environment for which the origin should be determined.
 * @returns {string} - The resolved origin for the specified environment. If no specific origin is found for the environment, the default origine is returned.
 */
// eslint-disable-next-line import/prefer-default-export
export const computeOriginForEnvironment = <Environment extends string = never>(
  origine: AuthorisedOrigins<Environment>,
  environment?: Environment,
): string => {
  if (typeof origine === 'string') {
    return origine;
  }

  return origine[environment] ?? origine.default;
};
