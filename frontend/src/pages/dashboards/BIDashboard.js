import React, { useMemo } from 'react';
import DashboardTemplate from '@/components/DashboardTemplate';
import { genTimeSeries, genBarData, genPieData, genGroupedData, DISTRICTS, SCHEMES, SECTORS, SKILLS, MONTHS, r } from '@/data/mockGenerators';
import { generateHeatmapData } from '@/components/charts/HeatmapChart';
import { generateSankeyData } from '@/components/charts/SankeyChart';

export default function BIDashboard() {
  const tabs = useMemo(() => [
    {
      id: 'trends', label: 'Trend Analysis',
      metrics: [
        { label: 'Placement Trend', value: 'Upward', trend: 12.5 },
        { label: 'Enrollment Trend', value: 'Stable', trend: 2.1 },
        { label: 'Dropout Trend', value: 'Declining', trend: -5.8 },
        { label: 'Salary Trend', value: 'Growing', trend: 7.2 },
      ],
      charts: [
        { type: 'multiline', title: 'Multi-Metric Trend Analysis', data: genGroupedData(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], ['Placements', 'Enrollments', 'Dropouts'], 20, 80), keys: ['Placements', 'Enrollments', 'Dropouts'], span: 2 },
        { type: 'area', title: 'Salary Growth Trend', data: genTimeSeries(15000, 3000), color: '#10B981' },
      ]
    },
    {
      id: 'cohort', label: 'Cohort Analysis',
      metrics: [
        { label: 'Best Performing Batch', value: 'Batch 2024-Q3', trend: null },
        { label: 'Avg Batch Placement', value: '65.2', suffix: '%', trend: 4.2 },
        { label: 'Top Course Success Rate', value: '82.5', suffix: '%', trend: 3.8 },
      ],
      charts: [
        { type: 'grouped', title: 'Batch-wise Placement Rate', data: genGroupedData(['B-2023Q1', 'B-2023Q2', 'B-2023Q3', 'B-2023Q4', 'B-2024Q1', 'B-2024Q2'], ['Enrolled', 'Trained', 'Placed'], 30, 90), keys: ['Enrolled', 'Trained', 'Placed'], span: 2 },
        { type: 'bar', title: 'Course-wise Success Rate', data: genBarData(['Web Dev', 'Data Sci', 'Nursing', 'Electrician', 'Tally', 'AutoCAD', 'Marketing'], 40, 85), color: '#6366F1' },
        { type: 'bar', title: 'District-wise Analysis', data: genBarData(DISTRICTS, 35, 85), color: '#2563EB', span: 2 },
      ]
    },
    {
      id: 'segmentation', label: 'Segmentation',
      metrics: [
        { label: 'Gender Gap Index', value: '0.18', trend: -4.5 },
        { label: 'Age Group Diversity', value: '0.72', trend: 2.1 },
        { label: 'Skill Diversity Score', value: '0.85', trend: 3.8 },
      ],
      charts: [
        { type: 'grouped', title: 'Gender-wise KPIs', data: genGroupedData(['Enrolled', 'Trained', 'Certified', 'Placed', 'Retained'], ['Male', 'Female', 'Other'], 20, 80), keys: ['Male', 'Female', 'Other'] },
        { type: 'pie', title: 'Age Distribution', data: genPieData(['18-21', '22-25', '26-30', '31-35', '35+']) },
        { type: 'horizontal', title: 'Skill-wise Placement Rate', data: genBarData(SKILLS.slice(0, 8), 40, 85), color: '#EC4899' },
      ]
    },
    {
      id: 'funnel', label: 'Funnel Analysis',
      metrics: [
        { label: 'Overall Conversion', value: '8.2', suffix: '%', trend: 1.5 },
        { label: 'Biggest Drop-off', value: 'Training Stage', trend: null },
      ],
      charts: [
        { type: 'bar', title: 'Registration to Placement Funnel', data: [
          { name: 'Registered', value: 124568 }, { name: 'Enrolled', value: 89234 },
          { name: 'Training', value: 67890 }, { name: 'Certified', value: 52345 },
          { name: 'Applied', value: 38456 }, { name: 'Interviewed', value: 24567 },
          { name: 'Placed', value: 18234 }
        ], color: '#2563EB', span: 2 },
        { type: 'bar', title: 'Drop-off Analysis', data: [
          { name: 'Reg→Enroll', value: 28 }, { name: 'Enroll→Train', value: 24 },
          { name: 'Train→Cert', value: 23 }, { name: 'Cert→Apply', value: 27 },
          { name: 'Apply→Int', value: 36 }, { name: 'Int→Place', value: 26 }
        ], color: '#EF4444' },
      ]
    },
    {
      id: 'efficiency', label: 'Efficiency & ROI',
      metrics: [
        { label: 'Cost vs Outcome Ratio', value: '0.72', trend: 5.2 },
        { label: 'ROI per Scheme', value: '245', suffix: '%', trend: 8.5 },
        { label: 'Cost Efficiency Score', value: '78.5', suffix: '/100', trend: 3.8 },
      ],
      charts: [
        { type: 'grouped', title: 'ROI per Scheme', data: genGroupedData(SCHEMES.slice(0, 6), ['Cost (Cr)', 'Returns (Cr)'], 5, 50), keys: ['Cost (Cr)', 'Returns (Cr)'], span: 2 },
        { type: 'gauge', title: 'Overall Efficiency', value: 79, gaugeLabel: 'Efficiency', color: '#10B981' },
      ]
    },
    {
      id: 'advanced', label: 'Advanced Analytics',
      metrics: [
        { label: 'Correlation Index', value: '0.82', trend: 2.1 },
        { label: 'Causal Impact Score', value: '0.68', trend: 4.5 },
        { label: 'Predictive Accuracy', value: '87.5', suffix: '%', trend: 1.8 },
      ],
      charts: [
        { type: 'multiline', title: 'Multi-variable Correlation', data: genGroupedData(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], ['Training', 'Placement', 'Salary', 'Satisfaction'], 30, 90), keys: ['Training', 'Placement', 'Salary', 'Satisfaction'], span: 2 },
        { type: 'pie', title: 'Impact Factor Distribution', data: genPieData(['Skills', 'Experience', 'Location', 'Education', 'Network']) },
      ]
    },
    {
      id: 'visualization', label: 'Visual Insights',
      metrics: [
        { label: 'Data Coverage', value: '94.5', suffix: '%', trend: 1.2 },
        { label: 'Report Generation', value: '1,245', trend: 5 },
        { label: 'Dashboard Views', value: '34,560', trend: 12 },
      ],
      charts: [
        { type: 'heatmap', title: 'District × Sector Performance Heatmap', data: generateHeatmapData(DISTRICTS.slice(0, 8), SECTORS), rowLabels: DISTRICTS.slice(0, 8), colLabels: SECTORS, span: 3, height: 350 },
        (() => { const sk = generateSankeyData(); return { type: 'sankey', title: 'Candidate Journey Flow (Sankey)', nodes: sk.nodes, links: sk.links, span: 3, height: 380 }; })(),
        { type: 'grouped', title: 'District Comparison', data: genGroupedData(DISTRICTS.slice(0, 6), ['Enrollment', 'Training', 'Placement'], 20, 80), keys: ['Enrollment', 'Training', 'Placement'], span: 2 },
        { type: 'area', title: 'Platform Usage Analytics', data: genTimeSeries(3000, 1000), color: '#0EA5E9' },
        { type: 'pie', title: 'Data Source Distribution', data: genPieData(['MahaRojgar', 'Kaushalya', 'DVET', 'MSInS', 'External']) },
      ],
    },
    {
      id: 'derived', label: 'Derived Metrics',
      metrics: [
        { label: 'Composite Success Index', value: '74.5', suffix: '/100', trend: 3.8 },
        { label: 'State Readiness Score', value: '72.3', suffix: '/100', trend: 5.2 },
        { label: 'Policy Impact Score', value: '68.4', suffix: '/100', trend: 4.5 },
        { label: 'Digital Maturity Index', value: '0.72', trend: 8.2 },
        { label: 'Ecosystem Health Score', value: '78.5', suffix: '/100', trend: 2.8 },
        { label: 'Stakeholder Trust Index', value: '0.85', trend: 1.5 },
        { label: 'Innovation Score', value: '65.2', suffix: '/100', trend: 12 },
        { label: 'Sustainability Index', value: '0.78', trend: 3.5 },
        { label: 'Inclusivity Quotient', value: '0.82', trend: 4.8 },
        { label: 'Growth Potential Score', value: '72.5', suffix: '/100', trend: 6.2 },
        { label: 'Quality of Life Impact', value: '0.68', trend: 3.2 },
        { label: 'Economic Multiplier', value: '2.45', trend: 5.5 },
        { label: 'Social Impact Score', value: '74.2', suffix: '/100', trend: 4.2 },
      ],
      charts: [
        { type: 'bar', title: 'Composite Index Components', data: genBarData(['Success', 'Readiness', 'Policy', 'Digital', 'Ecosystem', 'Innovation'], 55, 85), color: '#6366F1', span: 2 },
      ]
    },
  ], []);

  return <DashboardTemplate title="BI / Analytics Dashboard" subtitle="Trends, Cohorts, Funnels & Advanced Analytics" level="Level 5 - Analytical" tabs={tabs} />;
}
