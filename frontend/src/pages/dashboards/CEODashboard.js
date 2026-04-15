import React, { useMemo } from 'react';
import DashboardTemplate from '@/components/DashboardTemplate';
import { genTimeSeries, genBarData, genPieData, genGroupedData, genFunnel, DISTRICTS, SCHEMES, SKILLS, MONTHS, r, rDec } from '@/data/mockGenerators';
import { generateHeatmapData } from '@/components/charts/HeatmapChart';
import { generateSankeyData } from '@/components/charts/SankeyChart';

export default function CEODashboard() {
  const tabs = useMemo(() => [
    {
      id: 'employment', label: 'Employment Outcomes',
      metrics: [
        { label: 'Total Registered Candidates', value: '1,24,56,890', trend: 12.5 },
        { label: 'Total Active Candidates', value: '8,32,450', trend: 5.2 },
        { label: 'Total Placed Candidates', value: '38,54,200', trend: 8.7 },
        { label: 'Placement Rate', value: '62', suffix: '%', trend: 3.1 },
        { label: 'Monthly Placements', value: '45,230', trend: 6.4 },
        { label: 'YoY Placement Growth', value: '18.5', suffix: '%', trend: 2.3 },
        { label: 'Avg Salary Offered', value: '18,500', suffix: '', trend: 7.2 },
        { label: 'Median Salary', value: '15,200', trend: 5.8 },
        { label: 'High-paying Jobs (>5L)', value: '14.2', suffix: '%', trend: 4.1 },
        { label: 'Women Placement', value: '42.3', suffix: '%', trend: 6.8 },
      ],
      charts: [
        { type: 'bar', title: 'Monthly Placements Trend', data: genTimeSeries(4500, 1500), color: '#2563EB' },
        { type: 'line', title: 'YoY Placement Growth', data: genTimeSeries(18, 8), color: '#10B981' },
        { type: 'pie', title: 'Salary Distribution', data: genPieData(['<2L', '2-5L', '5-10L', '>10L']) },
      ]
    },
    {
      id: 'skills', label: 'Skill Ecosystem',
      metrics: [
        { label: 'Total Trainings Completed', value: '8,45,320', trend: 15.3 },
        { label: 'Certification Rate', value: '78.5', suffix: '%', trend: 4.2 },
        { label: 'Skill Gap Index', value: '0.34', trend: -5.1 },
        { label: 'Demand vs Supply Ratio', value: '1.42', trend: -2.3 },
        { label: 'Emerging Skills Adoption', value: '23.5', suffix: '%', trend: 12.1 },
        { label: 'Digital Skill Penetration', value: '45.8', suffix: '%', trend: 8.7 },
      ],
      charts: [
        { type: 'horizontal', title: 'Top 10 Skills Demand Index', data: genBarData(SKILLS, 40, 95), color: '#6366F1', span: 2 },
        { type: 'bar', title: 'Skill Training by Sector', data: genBarData(['IT', 'Mfg', 'Health', 'Agri', 'Const', 'Retail'], 200, 800), color: '#2563EB' },
      ]
    },
    {
      id: 'schemes', label: 'Scheme Performance',
      metrics: [
        { label: 'Scheme Enrollment Rate', value: '82.3', suffix: '%', trend: 3.5 },
        { label: 'Scheme Completion Rate', value: '68.7', suffix: '%', trend: 4.2 },
        { label: 'Scheme ROI', value: '245', suffix: '%', trend: 12.1 },
        { label: 'Cost per Placement', value: '12,450', trend: -8.3 },
        { label: 'Budget Utilization', value: '87.2', suffix: '%', trend: 5.1 },
        { label: 'Scheme Dropout Rate', value: '14.8', suffix: '%', trend: -3.2 },
        { label: 'Beneficiary Satisfaction', value: '4.2/5', trend: 2.1 },
      ],
      charts: [
        { type: 'grouped', title: 'Scheme Performance Comparison', data: genGroupedData(SCHEMES.slice(0, 6), ['Enrolled', 'Completed', 'Placed'], 100, 800), keys: ['Enrolled', 'Completed', 'Placed'], span: 2 },
        { type: 'gauge', title: 'Budget Utilization', value: 87, gaugeLabel: 'Utilized', color: '#10B981' },
      ]
    },
    {
      id: 'geography', label: 'Geography',
      metrics: [
        { label: 'District Performance Index', value: '72.5', suffix: '/100', trend: 3.8 },
        { label: 'Top Performing Districts', value: '12', trend: 2 },
        { label: 'Bottom Performing Districts', value: '5', trend: -1 },
        { label: 'Rural vs Urban Ratio', value: '0.78', trend: 4.5 },
        { label: 'Aspirational District Coverage', value: '85.3', suffix: '%', trend: 7.2 },
      ],
      charts: [
        { type: 'bar', title: 'District Performance Index', data: genBarData(DISTRICTS, 40, 95), color: '#2563EB', span: 2 },
        { type: 'pie', title: 'Rural vs Urban Distribution', data: genPieData(['Rural', 'Semi-Urban', 'Urban']) },
        { type: 'heatmap', title: 'District Performance Heatmap (Monthly)', data: generateHeatmapData(DISTRICTS.slice(0, 8), MONTHS), rowLabels: DISTRICTS.slice(0, 8), colLabels: MONTHS, span: 3, height: 350 },
      ]
    },
    {
      id: 'inclusion', label: 'Inclusion',
      metrics: [
        { label: 'Women Participation', value: '42.3', suffix: '%', trend: 6.8 },
        { label: 'SC/ST Participation', value: '28.5', suffix: '%', trend: 4.2 },
        { label: 'Divyang Participation', value: '3.2', suffix: '%', trend: 8.5 },
        { label: 'Minority Participation', value: '18.7', suffix: '%', trend: 3.1 },
        { label: 'First-time Job Seekers', value: '65.4', suffix: '%', trend: 2.3 },
      ],
      charts: [
        { type: 'pie', title: 'Category-wise Participation', data: genPieData(['General', 'OBC', 'SC', 'ST', 'Minority']) },
        { type: 'grouped', title: 'Inclusion Trends (Monthly)', data: genGroupedData(['Q1', 'Q2', 'Q3', 'Q4'], ['Women', 'SC/ST', 'Minority'], 15, 45), keys: ['Women', 'SC/ST', 'Minority'] },
      ]
    },
    {
      id: 'economic', label: 'Economic Impact',
      metrics: [
        { label: 'Household Income Increase', value: '34.5', suffix: '%', trend: 5.2 },
        { label: 'Employment Elasticity Index', value: '0.72', trend: 3.1 },
        { label: 'Informal to Formal Transition', value: '28.3', suffix: '%', trend: 7.8 },
        { label: 'Migration Reduction', value: '15.2', suffix: '%', trend: 4.5 },
      ],
      charts: [
        { type: 'area', title: 'Income Growth Trend', data: genTimeSeries(25, 10), color: '#10B981', span: 2 },
        { type: 'bar', title: 'Employment Funnel', data: genFunnel(['Registered', 'Enrolled', 'Trained', 'Certified', 'Placed']), color: '#2563EB' },
        (() => { const sk = generateSankeyData(); return { type: 'sankey', title: 'Candidate Flow (Sankey)', nodes: sk.nodes, links: sk.links, span: 3, height: 380 }; })(),
      ]
    },
    {
      id: 'efficiency', label: 'Efficiency',
      metrics: [
        { label: 'Time to Placement (days)', value: '45', trend: -8.3 },
        { label: 'Cost Efficiency Index', value: '0.82', trend: 5.1 },
        { label: 'Vacancy Fulfillment Rate', value: '73.5', suffix: '%', trend: 4.2 },
        { label: 'Employer Satisfaction', value: '4.1/5', trend: 2.8 },
      ],
      charts: [
        { type: 'line', title: 'Time to Placement Trend', data: genTimeSeries(50, 15), color: '#F59E0B' },
        { type: 'gauge', title: 'Cost Efficiency', value: 82, gaugeLabel: 'Efficiency', color: '#2563EB' },
      ]
    },
    {
      id: 'risk', label: 'Risk & Alerts',
      metrics: [
        { label: 'Skill Mismatch Index', value: '0.28', trend: -4.2 },
      ],
      alerts: [
        { label: 'High Dropout Districts', value: '7 Districts', severity: 'danger' },
        { label: 'Low Placement Alerts', value: '12 Active', severity: 'warning' },
        { label: 'Budget Overrun Alerts', value: '3 Schemes', severity: 'danger' },
      ],
      charts: [
        { type: 'bar', title: 'Dropout Rate by District', data: genBarData(DISTRICTS.slice(0, 8), 5, 25), color: '#EF4444', span: 2 },
      ]
    },
    {
      id: 'digital', label: 'Digital Adoption',
      metrics: [
        { label: 'Platform Usage Rate', value: '78.5', suffix: '%', trend: 12.3 },
        { label: 'Mobile Usage', value: '64.2', suffix: '%', trend: 8.7 },
        { label: 'Daily Active Users', value: '2,34,500', trend: 15.2 },
        { label: 'AI Recommendation Usage', value: '45.8', suffix: '%', trend: 22.1 },
      ],
      charts: [
        { type: 'area', title: 'Platform Usage Trend', data: genTimeSeries(65, 20), color: '#6366F1' },
        { type: 'pie', title: 'Device Distribution', data: genPieData(['Mobile', 'Desktop', 'Tablet']) },
      ]
    },
  ], []);

  return <DashboardTemplate title="CEO / Government Dashboard" subtitle="Outcome + Policy + Impact" level="Level 1 - Strategic" tabs={tabs} />;
}
