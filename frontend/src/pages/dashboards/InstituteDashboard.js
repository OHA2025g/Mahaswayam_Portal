import React, { useMemo } from 'react';
import DashboardTemplate from '@/components/DashboardTemplate';
import { genTimeSeries, genBarData, genPieData, genGroupedData, r } from '@/data/mockGenerators';

export default function InstituteDashboard() {
  const tabs = useMemo(() => [
    {
      id: 'enrollment', label: 'Enrollment & Batches',
      metrics: [
        { label: 'Enrollment Rate', value: '85.3', suffix: '%', trend: 4.2 },
        { label: 'Batch Utilization', value: '78.5', suffix: '%', trend: 3.1 },
        { label: 'Course Fill Rate', value: '82.1', suffix: '%', trend: 5.5 },
        { label: 'Repeat Enrollment', value: '12.3', suffix: '%', trend: 2.8 },
        { label: 'Completion Rate', value: '72.5', suffix: '%', trend: 3.8 },
        { label: 'Dropout Rate', value: '14.2', suffix: '%', trend: -4.5 },
      ],
      charts: [
        { type: 'grouped', title: 'Batch-wise Enrollment', data: genGroupedData(['Batch A', 'Batch B', 'Batch C', 'Batch D', 'Batch E'], ['Capacity', 'Enrolled', 'Completed'], 20, 60), keys: ['Capacity', 'Enrolled', 'Completed'], span: 2 },
        { type: 'pie', title: 'Enrollment by Course Type', data: genPieData(['Technical', 'Non-Tech', 'Soft Skills', 'Digital', 'Vocational']) },
      ]
    },
    {
      id: 'performance', label: 'Performance',
      metrics: [
        { label: 'Trainer Performance', value: '82.5', suffix: '/100', trend: 3.2 },
        { label: 'Attendance', value: '78.3', suffix: '%', trend: 2.1 },
        { label: 'Certification Rate', value: '68.5', suffix: '%', trend: 4.8 },
        { label: 'Course Effectiveness', value: '74.2', suffix: '/100', trend: 3.5 },
        { label: 'Student Feedback', value: '4.2/5', trend: 1.8 },
        { label: 'Trainer-to-Student Ratio', value: '1:18', trend: 0 },
      ],
      charts: [
        { type: 'bar', title: 'Trainer Performance Scores', data: genBarData(['Trainer A', 'Trainer B', 'Trainer C', 'Trainer D', 'Trainer E', 'Trainer F'], 60, 95), color: '#6366F1' },
        { type: 'line', title: 'Attendance Trend', data: genTimeSeries(78, 10), color: '#10B981' },
      ]
    },
    {
      id: 'placements', label: 'Placements',
      metrics: [
        { label: 'Placement Rate', value: '62.5', suffix: '%', trend: 5.2 },
        { label: 'Avg Salary Offered', value: '18,500', trend: 7.8 },
        { label: 'Internship Conversion', value: '42.3', suffix: '%', trend: 6.5 },
        { label: 'Placement Time', value: '45 days', trend: -8.2 },
        { label: 'Placement Quality Score', value: '74.5', suffix: '/100', trend: 3.8 },
        { label: 'Certification Success', value: '82.3', suffix: '%', trend: 2.5 },
      ],
      charts: [
        { type: 'area', title: 'Monthly Placements', data: genTimeSeries(45, 15), color: '#2563EB', span: 2 },
        { type: 'pie', title: 'Placement by Sector', data: genPieData(['IT', 'Manufacturing', 'Healthcare', 'Retail', 'Banking']) },
      ]
    },
    {
      id: 'infra', label: 'Infrastructure',
      metrics: [
        { label: 'Infrastructure Utilization', value: '72.5', suffix: '%', trend: 3.2 },
        { label: 'Digital Adoption', value: '68.4', suffix: '%', trend: 12.5 },
        { label: 'Industry Tie-ups', value: '28', trend: 5 },
        { label: 'Skill Coverage Index', value: '0.78', trend: 4.2 },
      ],
      progress: [
        { label: 'Lab Utilization', value: 82 },
        { label: 'Library Usage', value: 65 },
        { label: 'Workshop Usage', value: 78 },
        { label: 'Digital Lab', value: 72 },
      ],
      charts: [
        { type: 'bar', title: 'Infrastructure Usage by Facility', data: genBarData(['Computer Lab', 'Workshop', 'Library', 'Auditorium', 'Sports', 'Canteen'], 40, 90), color: '#0EA5E9' },
      ]
    },
    {
      id: 'revenue', label: 'Revenue & Costs',
      metrics: [
        { label: 'Revenue per Batch', value: '4.5L', trend: 8.2 },
        { label: 'Cost per Student', value: '12,450', trend: -3.5 },
        { label: 'Local Employment Rate', value: '58.3', suffix: '%', trend: 4.2 },
      ],
      charts: [
        { type: 'grouped', title: 'Revenue vs Cost per Batch', data: genGroupedData(['Batch 1', 'Batch 2', 'Batch 3', 'Batch 4', 'Batch 5'], ['Revenue', 'Cost'], 2, 8), keys: ['Revenue', 'Cost'] },
        { type: 'line', title: 'Revenue Trend', data: genTimeSeries(4, 2), color: '#10B981' },
      ]
    },
    {
      id: 'alumni', label: 'Alumni & Outcomes',
      metrics: [
        { label: 'Alumni Success Rate', value: '72.5', suffix: '%', trend: 4.5 },
        { label: 'Higher Education Rate', value: '18.3', suffix: '%', trend: 3.2 },
        { label: 'Entrepreneurship Rate', value: '5.2', suffix: '%', trend: 8.5 },
        { label: 'Avg 1-Year Retention', value: '78.5', suffix: '%', trend: 2.1 },
        { label: 'Salary Growth (1yr)', value: '22.3', suffix: '%', trend: 5.8 },
        { label: 'Industry Feedback Score', value: '4.1/5', trend: 1.5 },
        { label: 'Employer Return Rate', value: '65.3', suffix: '%', trend: 4.2 },
        { label: 'On-the-Job Training', value: '42.5', suffix: '%', trend: 6.8 },
        { label: 'Apprenticeship Conv.', value: '38.2', suffix: '%', trend: 5.5 },
        { label: 'Self-Employment Rate', value: '8.5', suffix: '%', trend: 12.3 },
      ],
      charts: [
        { type: 'bar', title: 'Alumni Career Outcomes', data: genBarData(['Employed', 'Higher Ed', 'Self-Emp', 'Freelance', 'Searching'], 5, 45), color: '#8B5CF6', span: 2 },
      ]
    },
  ], []);

  return <DashboardTemplate title="Institute Dashboard" subtitle="Enrollment, Training, Placements & Infrastructure" level="Level 3 - Execution" tabs={tabs} />;
}
