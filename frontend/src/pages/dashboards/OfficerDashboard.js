import React, { useMemo } from 'react';
import DashboardTemplate from '@/components/DashboardTemplate';
import { genTimeSeries, genBarData, genPieData, genGroupedData, DISTRICTS, SCHEMES, r } from '@/data/mockGenerators';

export default function OfficerDashboard() {
  const tabs = useMemo(() => [
    {
      id: 'scheme-exec', label: 'Scheme Execution',
      metrics: [
        { label: 'Active Schemes Count', value: '42', trend: 5 },
        { label: 'Scheme Progress', value: '72.5', suffix: '%', trend: 4.2 },
        { label: 'Enrollment vs Target', value: '85.3', suffix: '%', trend: 3.1 },
        { label: 'Completion Rate', value: '68.7', suffix: '%', trend: 2.8 },
        { label: 'Dropout Rate', value: '14.2', suffix: '%', trend: -3.5 },
      ],
      charts: [
        { type: 'grouped', title: 'Scheme Enrollment vs Target', data: genGroupedData(SCHEMES.slice(0, 6), ['Target', 'Enrolled', 'Completed'], 200, 1000), keys: ['Target', 'Enrolled', 'Completed'], span: 2 },
        { type: 'gauge', title: 'Overall Progress', value: 73, gaugeLabel: 'Progress', color: '#2563EB' },
      ]
    },
    {
      id: 'district', label: 'District Monitoring',
      metrics: [
        { label: 'District Rank', value: '#3/36', trend: 2 },
        { label: 'Block Performance Index', value: '68.4', suffix: '/100', trend: 3.5 },
        { label: 'Underperforming Blocks', value: '8', trend: -2 },
        { label: 'Coverage Ratio', value: '82.5', suffix: '%', trend: 4.1 },
      ],
      charts: [
        { type: 'bar', title: 'District Rankings', data: genBarData(DISTRICTS, 40, 95), color: '#2563EB', span: 2 },
        { type: 'pie', title: 'Performance Distribution', data: genPieData(['Excellent', 'Good', 'Average', 'Below Avg', 'Poor']) },
      ]
    },
    {
      id: 'financial', label: 'Financial',
      metrics: [
        { label: 'Budget Allocated', value: '245 Cr', trend: 8.5 },
        { label: 'Budget Utilized', value: '198 Cr', trend: 12.3 },
        { label: 'Fund Release Delay', value: '12 days', trend: -15 },
        { label: 'Cost per Candidate', value: '8,450', trend: -5.2 },
      ],
      charts: [
        { type: 'grouped', title: 'Budget Allocation vs Utilization', data: genGroupedData(['Q1', 'Q2', 'Q3', 'Q4'], ['Allocated', 'Utilized'], 30, 80), keys: ['Allocated', 'Utilized'], span: 2 },
        { type: 'gauge', title: 'Budget Utilization', value: 81, gaugeLabel: 'Utilized', color: '#10B981' },
      ]
    },
    {
      id: 'approvals', label: 'Approvals & Placement',
      metrics: [
        { label: 'Pending Approvals', value: '34', trend: -8 },
        { label: 'Avg Approval Time', value: '4.2 days', trend: -12 },
        { label: 'SLA Compliance', value: '88.5', suffix: '%', trend: 3.2 },
        { label: 'Job Openings', value: '12,450', trend: 5.8 },
        { label: 'Placement Pipeline', value: '8,230', trend: 7.2 },
        { label: 'Offer Acceptance Rate', value: '72.3', suffix: '%', trend: 2.1 },
      ],
      charts: [
        { type: 'line', title: 'Approval Time Trend', data: genTimeSeries(5, 2), color: '#F59E0B' },
        { type: 'bar', title: 'Placement Pipeline by Sector', data: genBarData(['IT', 'Mfg', 'Health', 'Agri', 'Retail', 'Banking'], 200, 2000), color: '#2563EB' },
      ]
    },
    {
      id: 'institutes', label: 'Institute Monitoring',
      metrics: [
        { label: 'Active Institutes', value: '1,245', trend: 4.2 },
        { label: 'Institute Performance Score', value: '74.5', suffix: '/100', trend: 3.1 },
        { label: 'Low-performing Institutes', value: '45', trend: -8 },
      ],
      charts: [
        { type: 'bar', title: 'Institute Performance Distribution', data: genBarData(['A+ Grade', 'A Grade', 'B Grade', 'C Grade', 'D Grade'], 50, 400), color: '#6366F1' },
        { type: 'horizontal', title: 'Top Institutes by Placement', data: genBarData(['ITI Mumbai', 'MSSDS Pune', 'KV Nagpur', 'ITI Thane', 'DVET Nash.', 'MSSDS Aur.'], 60, 98), color: '#10B981' },
      ]
    },
    {
      id: 'alerts-ops', label: 'Alerts & Field Ops',
      alerts: [
        { label: 'Dropout Alerts', value: '12 Active', severity: 'danger' },
        { label: 'Low Enrollment Alerts', value: '8 Districts', severity: 'warning' },
        { label: 'Budget Risk Alerts', value: '3 Schemes', severity: 'danger' },
      ],
      metrics: [
        { label: 'Field Visits Completed', value: '234', trend: 15 },
        { label: 'Inspection Score', value: '78.5', suffix: '/100', trend: 4.2 },
        { label: 'Compliance Score', value: '85.3', suffix: '%', trend: 2.8 },
      ],
      charts: [
        { type: 'bar', title: 'Field Visit Schedule', data: genBarData(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], 15, 45), color: '#0EA5E9' },
      ]
    },
    {
      id: 'grievances', label: 'Grievances & Data',
      metrics: [
        { label: 'Complaints Received', value: '456', trend: -5 },
        { label: 'Resolution Rate', value: '82.3', suffix: '%', trend: 4.5 },
        { label: 'Escalation Rate', value: '12.5', suffix: '%', trend: -3.2 },
        { label: 'Missing Data', value: '2.3', suffix: '%', trend: -8 },
        { label: 'Data Validation Errors', value: '145', trend: -12 },
      ],
      charts: [
        { type: 'pie', title: 'Grievance Categories', data: genPieData(['Technical', 'Scheme', 'Payment', 'Certificate', 'Other']) },
        { type: 'line', title: 'Resolution Trend', data: genTimeSeries(80, 10), color: '#10B981' },
      ]
    },
    {
      id: 'efficiency-adopt', label: 'Efficiency & Adoption',
      metrics: [
        { label: 'Case Processing Time', value: '3.5 days', trend: -10 },
        { label: 'Resource Utilization', value: '78.2', suffix: '%', trend: 5.1 },
        { label: 'System Usage', value: '85.3', suffix: '%', trend: 8.2 },
        { label: 'Officer Login Rate', value: '92.1', suffix: '%', trend: 3.5 },
        { label: 'Report Submission Rate', value: '88.4', suffix: '%', trend: 4.2 },
        { label: 'Timeliness Score', value: '82.5', suffix: '%', trend: 2.8 },
        { label: 'Inclusion Coverage', value: '78.3', suffix: '%', trend: 5.5 },
        { label: 'Gender Ratio', value: '1:0.85', trend: 4.2 },
        { label: 'Daily Activity Score', value: '74.5', suffix: '/100', trend: 3.1 },
        { label: 'Intervention Effectiveness', value: '68.4', suffix: '%', trend: 6.2 },
        { label: 'Action Closure Rate', value: '82.1', suffix: '%', trend: 4.8 },
        { label: 'Risk Resolution Rate', value: '75.3', suffix: '%', trend: 5.5 },
      ],
      charts: [
        { type: 'area', title: 'System Adoption Trend', data: genTimeSeries(80, 15), color: '#6366F1', span: 2 },
      ]
    },
  ], []);

  return <DashboardTemplate title="Government Officer Dashboard" subtitle="Scheme Execution, District Monitoring & Field Ops" level="Level 2 - Operational" tabs={tabs} />;
}
