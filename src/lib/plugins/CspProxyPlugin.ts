import { configureCspProxyServer, generateNonce } from '@lib/csp-proxy/CspProxy';
import { CspPolicies } from '@lib/csp/CspDirectives';
import { ReportType } from '@lib/csp/CspHeaders';
import { Plugin, ViteDevServer } from 'vite';

export type NoncesConfiguration<Environment> = {
  nonceTemplate: string,
  developmentKey?: Environment,
};

/**
 * This type is used to define the rules and reporting behavior for Content Security Policy (CSP).
 *
 * @template Environment - Specifies the environment type to customize CSP rules per environment.
 *
 * @property rules - A set of CSP policies specified for different environments. This ensures the appropriate CSP rules are applied based on the defined environment type.
 * @property reportType - The type of report to be generated for CSP violations. This property is optional.
 * @property noncesConfiguration - Nonces configuration
 */
export type CspProxyPluginOptions<Environment extends string = never> = {
  rules: CspPolicies<Environment>,
  reportType?: ReportType,
  noncesConfiguration?: NoncesConfiguration<Environment>,
};

/**
 * A Vite plugin that configures a Content-Security-Policy (CSP) proxy server.
 *
 * This plugin allows the user to define CSP rules and an optional reporting type to enforce
 * and report CSP policies in a development environment. It integrates with the Vite dev server
 * to apply the specified CSP rules during runtime.
 *
 * @template Environment - The type of the environment, defaults to `never` when not specified.
 * @param {CspProxyPluginOptions<Environment>} options - The options to configure the CSP proxy plugin.
 * @param {CspPolicies<Environment>} options.rules - An object defining the CSP rules to be enforced.
 * @param {string} [options.reportType] - An optional report type to specify how CSP violations should be reported.
 * @returns {Plugin} A Vite plugin object with the required CSP configuration.
 */
export const cspProxyPlugin = <Environment extends string = never>(
  {
    rules,
    reportType,
    noncesConfiguration,
  }: CspProxyPluginOptions<Environment>,
): Plugin => {
  const nonce: string = generateNonce();

  return ({
    name: 'csp-proxy-plugin',
    apply: 'serve',
    configureServer: (server: ViteDevServer) => {
      const htmlNonce: string | undefined = server.config.html?.cspNonce;
      // Nonce configuration must be enabled in vite and in the plugin in order to work
      if ((!htmlNonce && !!noncesConfiguration) || (!!htmlNonce && !noncesConfiguration)) {
        console.error(
          'Configure the html.cspNonce value in vite.config.ts to enable the nonce template replacement in the HTML template. ',
        );
      }

      // Replace placeholder in html.cspNonce with the generated nonce if the property has been set in Vite
      if (!!server.config.html) {
        server.config.html.cspNonce = nonce;
      }

      // Add CSP to headers
      configureCspProxyServer<Environment>(
        server,
        rules,
        nonce,
        reportType,
        noncesConfiguration,
      );
    },
  });
};
