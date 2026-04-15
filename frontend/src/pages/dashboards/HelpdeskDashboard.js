import React, { useMemo } from 'react';
import DashboardTemplate from '@/components/DashboardTemplate';
import { genTimeSeries, genBarData, genPieData, genGroupedData, r } from '@/data/mockGenerators';

export default function HelpdeskDashboard() {
  const tabs = useMemo(() => [
    {
      id: 'overview', label: 'Tickets Overview',
      metrics: [
        { label: 'Tickets Raised', value: '12,450', trend: 5.2 },
        { label: 'Tickets Resolved', value: '10,890', trend: 8.5 },
        { label: 'Pending Tickets', value: '1,560', trend: -12 },
        { label: 'Aging Tickets (>7d)', value: '234', trend: -8 },
        { label: 'Today\'s Tickets', value: '145', trend: 3.2 },
        { label: 'Repeat Issues', value: '8.5', suffix: '%', trend: -4.2 },
      ],
      charts: [
        { type: 'bar', title: 'Tickets by Category', data: genBarData(['Technical', 'Account', 'Payment', 'Certificate', 'Scheme', 'Other'], 200, 2500), color: '#2563EB', span: 2 },
        { type: 'pie', title: 'Ticket Status', data: genPieData(['Open', 'In Progress', 'Resolved', 'Closed', 'Escalated']) },
      ]
    },
    {
      id: 'sla', label: 'SLA & Performance',
      metrics: [
        { label: 'SLA Compliance', value: '88.5', suffix: '%', trend: 3.2 },
        { label: 'Avg Resolution Time', value: '4.2 hrs', trend: -12 },
        { label: 'First Response Time', value: '15 min', trend: -18 },
        { label: 'Escalation Rate', value: '8.5', suffix: '%', trend: -4.2 },
        { label: 'Resolution Accuracy', value: '92.3', suffix: '%', trend: 2.5 },
        { label: 'First Contact Resolution', value: '68.4', suffix: '%', trend: 5.8 },
      ],
      charts: [
        { type: 'line', title: 'SLA Compliance Trend', data: genTimeSeries(86, 8), color: '#10B981', span: 2 },
        { type: 'gauge', title: 'SLA Health', value: 89, gaugeLabel: 'Compliance', color: '#2563EB' },
      ]
    },
    {
      id: 'agents', label: 'Agent Productivity',
      metrics: [
        { label: 'Agent Productivity', value: '24.5', suffix: 'tickets/day', trend: 5.2 },
        { label: 'Active Agents', value: '45', trend: 3 },
        { label: 'Avg Handling Time', value: '12 min', trend: -8.5 },
        { label: 'Agent Utilization', value: '78.5', suffix: '%', trend: 2.8 },
        { label: 'Quality Score', value: '85.3', suffix: '/100', trend: 3.2 },
        { label: 'Training Hours', value: '8 hrs/mo', trend: 5 },
      ],
      charts: [
        { type: 'bar', title: 'Agent Performance', data: genBarData(['Agent A', 'Agent B', 'Agent C', 'Agent D', 'Agent E', 'Agent F', 'Agent G', 'Agent H'], 15, 35), color: '#6366F1' },
        { type: 'area', title: 'Tickets Handled per Day', data: genTimeSeries(120, 40), color: '#0EA5E9' },
      ]
    },
    {
      id: 'satisfaction', label: 'Customer Satisfaction',
      metrics: [
        { label: 'CSAT Score', value: '4.2/5', trend: 2.5 },
        { label: 'NPS Score', value: '+42', trend: 5.8 },
        { label: 'Satisfaction Rate', value: '85.3', suffix: '%', trend: 3.2 },
        { label: 'Feedback Response Rate', value: '42.5', suffix: '%', trend: 8.5 },
        { label: 'Complaint Rate', value: '3.2', suffix: '%', trend: -4.2 },
        { label: 'Resolution Satisfaction', value: '88.5', suffix: '%', trend: 2.1 },
      ],
      charts: [
        { type: 'line', title: 'CSAT Trend', data: genTimeSeries(82, 8), color: '#10B981' },
        { type: 'pie', title: 'Satisfaction Distribution', data: genPieData(['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied']) },
        { type: 'gauge', title: 'NPS Score', value: 72, gaugeLabel: 'NPS', color: '#6366F1' },
      ]
    },
    {
      id: 'automation', label: 'Automation & Bot',
      metrics: [
        { label: 'Bot Resolution', value: '42.5', suffix: '%', trend: 12.5 },
        { label: 'Manual Resolution', value: '57.5', suffix: '%', trend: -5.2 },
        { label: 'Chatbot Accuracy', value: '78.5', suffix: '%', trend: 4.2 },
        { label: 'Auto-routing Accuracy', value: '85.3', suffix: '%', trend: 3.8 },
        { label: 'Self-service Usage', value: '35.2', suffix: '%', trend: 15 },
        { label: 'Knowledge Base Hits', value: '8,450/day', trend: 8.5 },
      ],
      charts: [
        { type: 'grouped', title: 'Resolution by Channel', data: genGroupedData(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], ['Bot', 'Manual', 'Self-Service'], 100, 500), keys: ['Bot', 'Manual', 'Self-Service'], span: 2 },
        { type: 'line', title: 'Bot Resolution Growth', data: genTimeSeries(35, 10), color: '#EC4899' },
      ]
    },
    {
      id: 'load', label: 'Load & Operations',
      metrics: [
        { label: 'Peak Load Handling', value: '95.2', suffix: '%', trend: 2.1 },
        { label: 'Queue Wait Time', value: '3.5 min', trend: -12 },
        { label: 'Channel Distribution', value: 'Multi', trend: null },
        { label: 'After Hours Coverage', value: '68.5', suffix: '%', trend: 5.2 },
        { label: 'Ticket Backlog', value: '342', trend: -8 },
        { label: 'Priority P1 Open', value: '5', trend: -3 },
        { label: 'Priority P2 Open', value: '28', trend: -5 },
        { label: 'Avg Reopen Rate', value: '4.2', suffix: '%', trend: -2.8 },
        { label: 'Knowledge Gap Score', value: '0.18', trend: -5.2 },
        { label: 'Shift Coverage', value: '92.5', suffix: '%', trend: 1.5 },
      ],
      charts: [
        { type: 'area', title: 'Hourly Ticket Volume', data: genBarData(['6AM', '8AM', '10AM', '12PM', '2PM', '4PM', '6PM', '8PM', '10PM'], 10, 80), color: '#F59E0B', span: 2 },
        { type: 'pie', title: 'Channel Distribution', data: genPieData(['Phone', 'Email', 'Chat', 'Portal', 'WhatsApp']) },
      ]
    },
  ], []);

  return <DashboardTemplate title="Helpdesk Dashboard" subtitle="Ticket Management, SLA Compliance & Satisfaction" level="Level 3 - Execution" tabs={tabs} />;
}
