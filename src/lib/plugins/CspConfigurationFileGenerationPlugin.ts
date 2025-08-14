import {
  configureCspConfigurationFileGenerationPluginServer,
} from '@lib/csp-configuration-generation/CspConfigurationFileGeneration';
import { CspPolicies } from '@lib/csp/CspDirectives';
import { Plugin, ViteDevServer } from 'vite';

/**
 * Type representing options to generate CSP (Content Security Policy) configuration.
 *
 * @template Environment Specifies the environment type constraint for the configuration.
 * @property rules The set of rules defining CSP policies for specific environments.
 * @property environments A collection of environments where the CSP configuration is applied.
 * @property reportType Optional property to define the report mode. Can be 'report' or 'strict', default os 'strict'.
 * @property cspConfigurationFilePath Optional property specifying the file path where the CSP configuration is stored.
 */
export type CspConfigurationGenerationOptions<Environment extends string = never> = {
  rules: CspPolicies<Environment>,
  environments: Set<Environment>,
  reportType?: 'report' | 'strict',
  cspConfigurationFilePath?: string,
};

/**
 * A plugin to handle CSP (Content Security Policy) configuration file generation during a Vite development server's lifecycle.
 * It runs only when csp configuration file change
 *
 * @param {CspConfigurationGenerationOptions<Environment>} options The configuration options for the CSP file generation process.
 * @param {Record<string, string[]>} options.rules The CSP rules defined as a mapping of directives to allowed sources.
 * @param {Environment[]} options.environments The target environments for which the CSP configuration should be generated.
 * @param {string} options.reportType The type of CSP reporting method, such as 'report-only' or 'enforce'.
 * @param {string} options.cspConfigurationFilePath The file path where the generated CSP configuration should be stored.
 * @return {Plugin} A Vite plugin object for integration into the development server.
 */
export function cspConfigurationFileGenerationPlugin<Environment extends string = never>(
  {
    rules,
    environments,
    reportType,
    cspConfigurationFilePath,
  }: CspConfigurationGenerationOptions<Environment>,
): Plugin {
  return {
    name: 'csp-configuration-file-generation-plugin',

    apply: 'serve',

    configureServer: (server: ViteDevServer) => {
      return configureCspConfigurationFileGenerationPluginServer<Environment>(
        server,
        rules,
        environments,
        reportType,
        cspConfigurationFilePath,
      );
    },
  };
}
