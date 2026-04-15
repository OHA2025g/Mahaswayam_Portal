import React, { useMemo } from 'react';
import DashboardTemplate from '@/components/DashboardTemplate';
import { genTimeSeries, genBarData, genPieData, genGroupedData, r } from '@/data/mockGenerators';

export default function PMODashboard() {
  const tabs = useMemo(() => [
    {
      id: 'programs', label: 'Program Tracking',
      metrics: [
        { label: 'Total Programs', value: '52', trend: 8 },
        { label: 'Active Programs', value: '38', trend: 5 },
        { label: 'Completion %', value: '68.5', suffix: '%', trend: 4.2 },
        { label: 'Delay Index', value: '0.23', trend: -5.1 },
      ],
      charts: [
        { type: 'grouped', title: 'Program Status Distribution', data: genGroupedData(['Kaushalya', 'MahaRojgar', 'MSInS', 'DVET', 'MSBSVET', 'SEEID'], ['Active', 'Completed', 'Delayed'], 5, 15), keys: ['Active', 'Completed', 'Delayed'], span: 2 },
        { type: 'gauge', title: 'Overall Completion', value: 69, gaugeLabel: 'Complete', color: '#2563EB' },
      ]
    },
    {
      id: 'milestones', label: 'Milestones',
      metrics: [
        { label: 'Milestone Completion', value: '78.2', suffix: '%', trend: 5.3 },
        { label: 'Missed Milestones', value: '14', trend: -3 },
        { label: 'On-time Delivery', value: '72.5', suffix: '%', trend: 4.1 },
      ],
      progress: [
        { label: 'Phase 1: Infrastructure', value: 95 },
        { label: 'Phase 2: Development', value: 78 },
        { label: 'Phase 3: Testing', value: 55 },
        { label: 'Phase 4: Deployment', value: 32 },
      ],
      charts: [
        { type: 'line', title: 'Milestone Completion Timeline', data: genTimeSeries(75, 15), color: '#10B981', span: 2 },
      ]
    },
    {
      id: 'resources', label: 'Resources',
      metrics: [
        { label: 'Resource Allocation', value: '342', trend: 5 },
        { label: 'Utilization Rate', value: '82.3', suffix: '%', trend: 3.8 },
        { label: 'Overutilization', value: '12.5', suffix: '%', trend: -2.1 },
      ],
      charts: [
        { type: 'pie', title: 'Resource Distribution', data: genPieData(['Development', 'QA', 'Design', 'Management', 'Support']) },
        { type: 'bar', title: 'Resource Utilization by Team', data: genBarData(['Dev Team A', 'Dev Team B', 'QA', 'DevOps', 'Design', 'PM'], 50, 100), color: '#6366F1' },
      ]
    },
    {
      id: 'budget', label: 'Budget & Finance',
      metrics: [
        { label: 'Budget Burn Rate', value: '67.2', suffix: '%', trend: 3.5 },
        { label: 'Cost Variance', value: '-4.5', suffix: '%', trend: -2.1 },
        { label: 'Forecast Accuracy', value: '88.3', suffix: '%', trend: 1.8 },
      ],
      charts: [
        { type: 'area', title: 'Budget Burn Rate Trend', data: genTimeSeries(60, 20), color: '#F59E0B', span: 2 },
        { type: 'gauge', title: 'Budget Health', value: 85, gaugeLabel: 'On Track', color: '#10B981' },
      ]
    },
    {
      id: 'risks', label: 'Risks & Dependencies',
      metrics: [
        { label: 'Risk Count', value: '28', trend: -5 },
        { label: 'High-risk Programs', value: '5', trend: -2 },
        { label: 'Mitigation Effectiveness', value: '78.5', suffix: '%', trend: 4.2 },
        { label: 'Blocked Tasks', value: '12', trend: -3 },
        { label: 'Dependency Risk Score', value: '0.35', trend: -4.8 },
      ],
      alerts: [
        { label: 'Critical Risks', value: '3 Active', severity: 'danger' },
        { label: 'Blocked Dependencies', value: '5 Tasks', severity: 'warning' },
      ],
      charts: [
        { type: 'bar', title: 'Risk Distribution by Category', data: genBarData(['Technical', 'Resource', 'Budget', 'Timeline', 'External', 'Integration'], 2, 8), color: '#EF4444' },
      ]
    },
    {
      id: 'vendor', label: 'Vendor & Reporting',
      metrics: [
        { label: 'Vendor SLA Score', value: '82.5', suffix: '%', trend: 3.2 },
        { label: 'Delivery Compliance', value: '88.4', suffix: '%', trend: 2.8 },
        { label: 'Weekly Reports Submitted', value: '45/52', trend: 5 },
        { label: 'Dashboard Accuracy', value: '94.2', suffix: '%', trend: 1.5 },
      ],
      charts: [
        { type: 'grouped', title: 'Vendor Performance', data: genGroupedData(['Vendor A', 'Vendor B', 'Vendor C', 'Vendor D'], ['Quality', 'Timeliness', 'Cost'], 60, 95), keys: ['Quality', 'Timeliness', 'Cost'] },
        { type: 'line', title: 'Report Submission Trend', data: genTimeSeries(42, 8), color: '#0EA5E9' },
      ]
    },
    {
      id: 'governance-eff', label: 'Governance & Efficiency',
      metrics: [
        { label: 'Audit Compliance', value: '92.5', suffix: '%', trend: 2.1 },
        { label: 'Documentation Score', value: '85.3', suffix: '%', trend: 3.5 },
        { label: 'Cycle Time', value: '18 days', trend: -8 },
        { label: 'Lead Time', value: '25 days', trend: -5 },
        { label: 'Change Requests', value: '28', trend: -3 },
        { label: 'Approval Time', value: '3.2 days', trend: -12 },
        { label: 'Stakeholder Updates', value: '48/52', trend: 4 },
        { label: 'Escalations', value: '8', trend: -5 },
      ],
      charts: [
        { type: 'area', title: 'Cycle Time Trend', data: genTimeSeries(20, 8), color: '#8B5CF6' },
        { type: 'pie', title: 'Change Request Types', data: genPieData(['Scope', 'Timeline', 'Resource', 'Technical', 'Budget']) },
      ]
    },
    {
      id: 'tech-misc', label: 'Tech & Misc',
      metrics: [
        { label: 'System Uptime', value: '99.7', suffix: '%', trend: 0.2 },
        { label: 'Integration Success Rate', value: '94.5', suffix: '%', trend: 1.8 },
        { label: 'Productivity Index', value: '82.5', suffix: '/100', trend: 4.2 },
        { label: 'Quality Index', value: '88.3', suffix: '/100', trend: 2.5 },
        { label: 'Execution Score', value: '76.4', suffix: '/100', trend: 3.8 },
        { label: 'Sprint Velocity', value: '42', trend: 5 },
        { label: 'Defect Density', value: '0.12', trend: -8 },
        { label: 'Test Coverage', value: '78.5', suffix: '%', trend: 4.2 },
      ],
      charts: [
        { type: 'line', title: 'System Uptime History', data: genTimeSeries(99, 1), color: '#10B981' },
        { type: 'bar', title: 'Sprint Performance', data: genBarData(['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8'], 30, 55), color: '#2563EB' },
      ]
    },
  ], []);

  return <DashboardTemplate title="PMO Dashboard" subtitle="Program Tracking, Milestones, Budgets & Risks" level="Level 2 - Operational" tabs={tabs} />;
}
