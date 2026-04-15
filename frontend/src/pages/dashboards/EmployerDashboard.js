import React, { useMemo } from 'react';
import DashboardTemplate from '@/components/DashboardTemplate';
import { genTimeSeries, genBarData, genPieData, genGroupedData, SECTORS, r } from '@/data/mockGenerators';

export default function EmployerDashboard() {
  const tabs = useMemo(() => [
    {
      id: 'postings', label: 'Job Postings',
      metrics: [
        { label: 'Jobs Posted', value: '3,245', trend: 12.5 },
        { label: 'Active Jobs', value: '1,890', trend: 8.3 },
        { label: 'Applications Received', value: '45,670', trend: 15.2 },
        { label: 'Avg Applications/Job', value: '24.2', trend: 5.8 },
      ],
      charts: [
        { type: 'bar', title: 'Jobs Posted by Sector', data: genBarData(SECTORS, 100, 600), color: '#2563EB', span: 2 },
        { type: 'area', title: 'Job Posting Trend', data: genTimeSeries(250, 100), color: '#10B981' },
      ]
    },
    {
      id: 'pipeline', label: 'Hiring Pipeline',
      metrics: [
        { label: 'Shortlisting Rate', value: '32.5', suffix: '%', trend: 4.2 },
        { label: 'Interview Rate', value: '68.3', suffix: '%', trend: 3.1 },
        { label: 'Offer Rate', value: '42.5', suffix: '%', trend: 5.8 },
        { label: 'Hiring Rate', value: '35.2', suffix: '%', trend: 4.5 },
        { label: 'Time to Hire', value: '28 days', trend: -8.3 },
        { label: 'Cost per Hire', value: '5,450', trend: -5.2 },
      ],
      charts: [
        { type: 'bar', title: 'Hiring Funnel', data: [
          { name: 'Applied', value: 4567 }, { name: 'Shortlisted', value: 1484 },
          { name: 'Interviewed', value: 1014 }, { name: 'Offered', value: 431 },
          { name: 'Hired', value: 352 }
        ], color: '#6366F1', span: 2 },
        { type: 'line', title: 'Time to Hire Trend', data: genTimeSeries(30, 10), color: '#F59E0B' },
      ]
    },
    {
      id: 'quality', label: 'Quality & Satisfaction',
      metrics: [
        { label: 'Offer Acceptance', value: '78.5', suffix: '%', trend: 3.2 },
        { label: 'Skill Match Score', value: '0.82', trend: 4.5 },
        { label: 'Candidate Quality Score', value: '74.2', suffix: '/100', trend: 2.8 },
        { label: 'Employer Satisfaction', value: '4.2/5', trend: 1.5 },
        { label: 'Retention Rate', value: '82.3', suffix: '%', trend: 2.1 },
        { label: 'Attrition Rate', value: '12.5', suffix: '%', trend: -3.8 },
      ],
      charts: [
        { type: 'gauge', title: 'Overall Satisfaction', value: 84, gaugeLabel: 'Satisfaction', color: '#10B981' },
        { type: 'pie', title: 'Attrition Reasons', data: genPieData(['Better Offer', 'Relocation', 'Work Culture', 'Growth', 'Personal']) },
      ]
    },
    {
      id: 'diversity', label: 'Diversity & Campus',
      metrics: [
        { label: 'Diversity Hiring', value: '34.5', suffix: '%', trend: 8.2 },
        { label: 'Freshers Hiring', value: '45.2', suffix: '%', trend: 5.5 },
        { label: 'Campus Hiring', value: '28.3', suffix: '%', trend: 6.8 },
        { label: 'Women Hiring', value: '38.5', suffix: '%', trend: 7.2 },
        { label: 'Repeat Hiring Rate', value: '42.5', suffix: '%', trend: 3.8 },
      ],
      charts: [
        { type: 'grouped', title: 'Diversity Hiring by Category', data: genGroupedData(['Q1', 'Q2', 'Q3', 'Q4'], ['Women', 'SC/ST', 'Freshers', 'Campus'], 10, 50), keys: ['Women', 'SC/ST', 'Freshers', 'Campus'], span: 2 },
        { type: 'pie', title: 'Hiring Source', data: genPieData(['Campus', 'Portal', 'Referral', 'Agency', 'Walk-in']) },
      ]
    },
    {
      id: 'ai-tech', label: 'AI & Tech',
      metrics: [
        { label: 'AI Matching Usage', value: '56.8', suffix: '%', trend: 15.3 },
        { label: 'AI Match Accuracy', value: '82.3', suffix: '%', trend: 4.2 },
        { label: 'Auto-screening Rate', value: '45.2', suffix: '%', trend: 12.5 },
        { label: 'Digital Interview Rate', value: '38.5', suffix: '%', trend: 18.2 },
        { label: 'Hiring Funnel Conversion', value: '7.7', suffix: '%', trend: 2.1 },
        { label: 'Candidate Pipeline Health', value: '0.85', trend: 3.5 },
        { label: 'Job Description Quality', value: '78.3', suffix: '/100', trend: 4.8 },
        { label: 'Response Time to Apps', value: '2.3 days', trend: -15 },
        { label: 'Employer Brand Score', value: '72.5', suffix: '/100', trend: 5.2 },
        { label: 'Talent Pool Size', value: '12,450', trend: 8.5 },
      ],
      charts: [
        { type: 'line', title: 'AI Adoption Growth', data: genTimeSeries(45, 15), color: '#6366F1' },
        { type: 'bar', title: 'Tech Feature Usage', data: genBarData(['AI Match', 'Auto-Screen', 'Video Int.', 'Analytics', 'Chatbot'], 20, 60), color: '#2563EB' },
      ]
    },
  ], []);

  return <DashboardTemplate title="Employer Dashboard" subtitle="Hiring Pipeline, Job Postings & Talent Matching" level="Level 3 - Execution" tabs={tabs} />;
}
