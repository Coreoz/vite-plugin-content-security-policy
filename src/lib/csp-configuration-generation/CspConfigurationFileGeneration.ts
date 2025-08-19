import {
  computeOriginForEnvironment,
} from '@lib/csp/ComputeOriginForEnvironment';
import { AuthorisedOrigins, CspPolicies } from '@lib/csp/CspDirectives';
import { computeHeaderNameByReportType, ReportType } from '@lib/csp/CspHeaders';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { Logger } from 'simple-logging-system';
import { ViteDevServer } from 'vite';

const logger: Logger = new Logger('CspConfigurationFileGeneration');

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
  environment: Environment,
): string => {
  return Object
    .entries(policies)
    .map(([directive, value]: [string, AuthorisedOrigins<Environment>]) => {
      const allowedOrigin: string = computeOriginForEnvironment(value, environment);
      return `${directive} ${allowedOrigin}`;
    })
    .join('; ');
};

/**
 * Generates a configuration file content compatible with Nginx and Apache
 * servers by including the corresponding header directives.
 *
 * @param {string} headerName - The name of the header to be added to the configuration.
 * @param {string} directive - The value to be associated with the header.
 * @returns {string} A formatted string containing Nginx and Apache header configurations.
 */
export const computeConfigurationFileContent = (
  headerName: string,
  directive: string,
): string => {
  const nginxHeader: string = `add_header ${headerName} "${directive}";`;
  const apacheHeader: string = `Header set ${headerName} "${directive}"`;
  return `# Nginx configuration\n${nginxHeader}\n\n# Apache configuration\n${apacheHeader}\n`;
};

/**
 * Generates a Content Security Policy (CSP) configuration file for a specified environment.
 *
 * This function computes a CSP directive based on the given rules and environment,
 * then writes it to a configuration file in the corresponding environment-specific directory.
 *
 * @template Environment - The type representing the name of the environment (e.g., "production", "staging").
 * @param {string} headerName - The name of the CSP header (e.g., "Content-Security-Policy").
 * @param {CspPolicies<Environment>} rules - The CSP rules configuration for the specified environment.
 * @param {Environment} environment - The environment for which the CSP configuration is generated.
 * @returns {Promise<void>} A promise that resolves when the configuration file is successfully written.
 */
export const generateCspConfigurationFileForEnvironment = async <Environment extends string = never>(
  headerName: string,
  rules: CspPolicies<Environment>,
  environment: Environment,
): Promise<void> => {
  const directive: string = computeCspDirectiveForEnvironment(rules, environment);

  try {
    await mkdir('content-security-policy/configurations', { recursive: true });

    const cspPath: string = path.join('content-security-policy/configurations', `csp-configuration.${environment}.txt`);

    const content: string = computeConfigurationFileContent(headerName, directive);

    await writeFile(
      cspPath,
      content,
      { encoding: 'utf-8' },
    );
    logger.info(`✅ CSP configuration file generated successfully for environment: ${environment} at path: ${cspPath}`);
  } catch (error: unknown) {
    logger.error(`❌ Error generating CSP configuration file for environment ${environment}:`, error);
  }
};

/**
 * Configures the CSP (Content Security Policy) configuration file generation plugin for the Vite development server.
 * Ensures CSP configuration files are generated for specific environments and monitors changes to regenerate files dynamically
 * when file located at cspConfigurationFilePath or when vite.config.ts change
 *
 * @param server The Vite development server instance used to monitor file changes and handle dynamic updates.
 * @param rules The CSP policies or rules to apply for file generation across the specified environments.
 * @param environments A set of environment names for which CSP configuration files need to be generated.
 * @param reportType Optional parameter to specify the type of CSP report to generate.
 * @param cspConfigurationFilePath Optional file path for the CSP configuration. Defaults to 'content-security-policy/csp-configuration.ts' if not specified.
 * @return A promise that resolves once the plugin is fully configured and the initial CSP configuration files have been generated.
 */
export async function configureCspConfigurationFileGenerationPluginServer<Environment extends string = never>(
  server: ViteDevServer,
  rules: CspPolicies<Environment>,
  environments: Set<Environment>,
  reportType?: ReportType,
  cspConfigurationFilePath?: string,
) {
  const cspConfigPath: string = cspConfigurationFilePath ?? 'content-security-policy/csp-configuration.ts';

  const generateFiles = async () => {
    const headerName: string = computeHeaderNameByReportType(reportType);

    for (const environment of environments) {
      await generateCspConfigurationFileForEnvironment<Environment>(
        headerName,
        rules,
        environment,
      );
    }
  };

  // Generate files on startup
  await generateFiles();

  // Generate files when configuration change
  const handleOnChange = async (changedPath: string) => {
    const normalizedChangedPath: string = path.basename(changedPath);
    const normalizedCspPath: string = path.basename(cspConfigPath);
    const viteConfigurationFile: string = 'vite.config.ts';

    if ([normalizedCspPath, viteConfigurationFile].includes(normalizedChangedPath)) {
      await generateFiles();
    }
  };

  server.watcher.on('change', handleOnChange);
}
