import { describe, it, expect } from 'vitest';
import { computeHeaderNameByReportType, ReportType } from '@lib/csp/CspHeaders';

describe('computeHeaderNameByReportType', () => {
  it('should return Content-Security-Policy-Report-Only for report type', () => {
    const reportType: ReportType = 'report';

    const result: string = computeHeaderNameByReportType(reportType);

    expect(result).toBe('Content-Security-Policy-Report-Only');
  });

  it('should return Content-Security-Policy for strict type', () => {
    const reportType: ReportType = 'strict';

    const result: string = computeHeaderNameByReportType(reportType);

    expect(result).toBe('Content-Security-Policy');
  });

  it('should default to Content-Security-Policy when no report type is provided', () => {
    const result: string = computeHeaderNameByReportType();

    expect(result).toBe('Content-Security-Policy');
  });
});
