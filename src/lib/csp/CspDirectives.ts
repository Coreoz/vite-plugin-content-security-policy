export type ResourcesDirectives =
  | 'default-src'
  | 'script-src'
  | 'style-src'
  | 'connect-src'
  | 'object-src'
  | 'img-src'
  | 'frame-src'
  | 'child-src'
  | 'font-src'
  | 'manifest-src'
  | 'media-src'
  | 'report-to'
  | 'sandbox'
  | 'script-src-attr'
  | 'script-src-elem'
  | 'style-src-attr'
  | 'style-src-elem'
  | 'upgrade-insecure-requests'
  | 'worker-src'
  | 'fenced-frame-src';

export type DocumentDirectives = 'base-uri' | 'sandbox';

export type NavigationDirectives = 'form-action' | 'frame-ancestors';

export type ReportingDirectives = 'report-to';

export type OtherDirectives =
  'require-trusted-types-for'
  | 'trusted-types'
  | 'upgrade-insecure-requests';

export type DeprecatedDirectives = 'block-all-mixed-content' | 'report-uri';

export type Directives =
  ResourcesDirectives
  | DocumentDirectives
  | NavigationDirectives
  | ReportingDirectives
  | OtherDirectives
  | DeprecatedDirectives;

/**
 * A type that maps environment names to authorized origin strings while providing
 * a default origin fallback.
 *
 * This type enables the configuration of authorized origins specific to
 * various environments. Each environment is represented as a key, with its
 * corresponding authorized origin as the value. Additionally, a `default`
 * key is provided to specify the fallback origin to use if no specific environment
 * is matched.
 *
 * @template Environment A union of strings representing valid environment names.
 * Defaults to `never` if not provided.
 *
 * Example use case:
 * - Define specific origins for environments such as `development`, `staging`,
 *   and `production`.
 * - Utilize the `default` origin as a fallback if origins are not defined for the environment
 *
 * Example:
 * ```
 * export const authorisedOriginesByEnvironment: AuthorisedOriginesByEnvironment<Environment> = {
 *  default: '\'self\'',
 *  'development': 'self',
 *  'staging': '\'self\' https://staging.my-site.com',
 * }
 * ```
 */
export type AuthorisedOriginesByEnvironment<Environment extends string = never> = Partial<{
  [env in Environment]: string;
}> & {
  default: string,
};

export type DefaultOrigin = string;

export type AuthorisedOrigins<T extends string = never> =
  AuthorisedOriginesByEnvironment<T>
  | DefaultOrigin;

/**
 * Represents a collection of Content Security Policies (CSP) for a set of directives,
 * where each directive can be associated with a list of authorized origins.
 *
 * This type allows developers to define CSP policies for a given environment.
 *
 * @template Environment Represents the set of environments for which the policies may vary.
 *
 * Exemple :
 * ```
 * export const cspRules: CspPolicies<Environment> = {
 *   'default-src': '\'self\'',
 *   'img-src': '\'self\' https://staging.my-site.com',
 *   'style-src': {
 *     default: '\'self\'',
 *     'staging': 'https://staging.my-site.com',
 *   },
 * };
 * ```
 * */
export type CspPolicies<Environment extends string = never> = Partial<{
  [directive in Directives]: AuthorisedOrigins<Environment>;
}>;
