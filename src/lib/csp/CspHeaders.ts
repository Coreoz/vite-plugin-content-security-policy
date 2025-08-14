export type ReportType = 'report' | 'strict';

enum HeaderNames {
  CONTENT_SECURITY_POLICY = 'Content-Security-Policy',
  CONTENT_SECURITY_POLICY_REPORT_ONLY = 'Content-Security-Policy-Report-Only',
}

const HEADER_NAME_BY_REPORT_TYPE: Record<ReportType, string> = {
  report: HeaderNames.CONTENT_SECURITY_POLICY_REPORT_ONLY,
  strict: HeaderNames.CONTENT_SECURITY_POLICY,
};

/**
 * Computes the header name based on the provided report type.
 *
 * @param {ReportType} [reportType] - The type of the report used to determine the header name. Optional.
 * @returns {string} The computed header name corresponding to the given report type or the default value.
 */
export const computeHeaderNameByReportType = (reportType?: ReportType): string => (
  HEADER_NAME_BY_REPORT_TYPE[reportType ?? 'strict']
);
