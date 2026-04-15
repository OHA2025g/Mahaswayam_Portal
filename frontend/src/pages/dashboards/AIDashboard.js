import React, { useMemo } from 'react';
import DashboardTemplate from '@/components/DashboardTemplate';
import { genTimeSeries, genBarData, genPieData, genGroupedData, SECTORS, SKILLS, r } from '@/data/mockGenerators';

export default function AIDashboard() {
  const tabs = useMemo(() => [
    {
      id: 'predictions', label: 'Predictions',
      metrics: [
        { label: 'Predicted Placement Probability', value: '74.2', suffix: '%', trend: 3.5 },
        { label: 'Dropout Prediction Score', value: '0.82', trend: 4.1 },
        { label: 'Candidate Success Score', value: '68.5', suffix: '/100', trend: 2.8 },
        { label: 'Job Match Score', value: '0.76', trend: 5.2 },
        { label: 'Salary Prediction Index', value: '0.89', trend: 1.8 },
      ],
      charts: [
        { type: 'area', title: 'Placement Probability Trend', data: genTimeSeries(72, 10), color: '#2563EB', span: 2 },
        { type: 'gauge', title: 'Overall AI Accuracy', value: 89, gaugeLabel: 'Accuracy', color: '#10B981' },
      ]
    },
    {
      id: 'risk-intel', label: 'Risk Intelligence',
      metrics: [
        { label: 'High-risk Candidates', value: '12.5', suffix: '%', trend: -2.3 },
        { label: 'High-risk Institutes', value: '23', trend: -4 },
        { label: 'Scheme Failure Probability', value: '8.2', suffix: '%', trend: -1.5 },
        { label: 'Skill Obsolescence Index', value: '0.34', trend: -3.2 },
      ],
      alerts: [
        { label: 'Dropout Risk Districts', value: '8 High Risk', severity: 'danger' },
      ],
      charts: [
        { type: 'bar', title: 'Risk Score by District', data: genBarData(['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad', 'Solapur', 'Kolhapur'], 10, 80), color: '#EF4444', span: 2 },
      ]
    },
    {
      id: 'recommendations', label: 'Recommendations',
      metrics: [
        { label: 'Job Recommendation Accuracy', value: '84.5', suffix: '%', trend: 3.2 },
        { label: 'Skill Recommendation Effectiveness', value: '78.3', suffix: '%', trend: 4.8 },
        { label: 'Course Recommendation Conversion', value: '42.1', suffix: '%', trend: 6.5 },
        { label: 'Personalized Learning Uptake', value: '56.8', suffix: '%', trend: 8.2 },
      ],
      charts: [
        { type: 'line', title: 'Recommendation Accuracy Over Time', data: genTimeSeries(80, 10), color: '#6366F1' },
        { type: 'pie', title: 'Recommendation Types', data: genPieData(['Jobs', 'Skills', 'Courses', 'Mentors']) },
      ]
    },
    {
      id: 'anomaly', label: 'Anomaly Detection',
      metrics: [
        { label: 'Fraudulent Activity Alerts', value: '12', trend: -15 },
        { label: 'Fake Job Posting Detection', value: '34', trend: -8 },
      ],
      alerts: [
        { label: 'Placement Anomalies', value: '5 Detected', severity: 'warning' },
        { label: 'Enrollment Spikes', value: '3 Districts', severity: 'info' },
      ],
      charts: [
        { type: 'area', title: 'Anomaly Detection Trend', data: genTimeSeries(15, 8), color: '#EC4899', span: 2 },
      ]
    },
    {
      id: 'forecast', label: 'Workforce Forecast',
      metrics: [
        { label: 'Talent Shortage Index', value: '0.42', trend: -3.5 },
      ],
      charts: [
        { type: 'grouped', title: 'Future Skill Demand Forecast', data: genGroupedData(SKILLS.slice(0, 8), ['Current', 'Predicted'], 20, 90), keys: ['Current', 'Predicted'], span: 2 },
        { type: 'bar', title: 'Sector-wise Job Growth Prediction', data: genBarData(SECTORS, 5, 25), color: '#0EA5E9' },
        { type: 'line', title: 'Industry Hiring Forecast', data: genTimeSeries(5000, 2000), color: '#10B981', span: 2 },
      ]
    },
    {
      id: 'policy-sim', label: 'Policy Simulation',
      metrics: [
        { label: 'Impact Simulation Score', value: '78.5', suffix: '/100', trend: 4.2 },
        { label: 'Scheme Optimization Score', value: '82.3', suffix: '/100', trend: 3.8 },
        { label: 'Budget Reallocation Efficiency', value: '71.2', suffix: '%', trend: 5.1 },
        { label: 'Scenario Success Probability', value: '68.4', suffix: '%', trend: 2.7 },
      ],
      charts: [
        { type: 'grouped', title: 'Policy Impact Simulation', data: genGroupedData(['Scenario A', 'Scenario B', 'Scenario C', 'Scenario D'], ['Impact', 'Cost', 'Time'], 30, 90), keys: ['Impact', 'Cost', 'Time'] },
        { type: 'gauge', title: 'Optimization Score', value: 82, gaugeLabel: 'Optimized', color: '#6366F1' },
      ]
    },
    {
      id: 'model-perf', label: 'AI Model Performance',
      metrics: [
        { label: 'Model Accuracy', value: '89.2', suffix: '%', trend: 1.5 },
        { label: 'Precision / Recall', value: '0.87 / 0.91', trend: 2.1 },
        { label: 'Drift Detection Score', value: '0.12', trend: -3.4 },
        { label: 'Model Retraining Freq', value: '14 days', trend: 0 },
      ],
      charts: [
        { type: 'multiline', title: 'Model Performance Over Time', data: genGroupedData(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], ['Accuracy', 'Precision', 'Recall'], 75, 95), keys: ['Accuracy', 'Precision', 'Recall'], span: 2 },
      ]
    },
    {
      id: 'behavior', label: 'Behavioral Insights',
      metrics: [
        { label: 'Candidate Engagement Score', value: '72.4', suffix: '/100', trend: 5.3 },
        { label: 'Learning Behavior Index', value: '0.68', trend: 4.1 },
        { label: 'Application Abandonment Rate', value: '23.5', suffix: '%', trend: -3.2 },
      ],
      charts: [
        { type: 'bar', title: 'Drop-off Point Analysis', data: genBarData(['Registration', 'Profile', 'Skills', 'Application', 'Interview', 'Offer'], 10, 45), color: '#F59E0B' },
        { type: 'area', title: 'Engagement Score Trend', data: genTimeSeries(70, 15), color: '#EC4899' },
      ]
    },
    {
      id: 'automation', label: 'Automation',
      metrics: [
        { label: 'AI-driven Placements', value: '34.5', suffix: '%', trend: 12.3 },
        { label: 'Auto-matching Efficiency', value: '78.2', suffix: '%', trend: 5.8 },
        { label: 'Chatbot Resolution Rate', value: '68.4', suffix: '%', trend: 8.2 },
        { label: 'Automated Ticket Handling', value: '52.3', suffix: '%', trend: 10.5 },
      ],
      charts: [
        { type: 'line', title: 'Automation Growth', data: genTimeSeries(40, 15), color: '#2563EB' },
        { type: 'pie', title: 'Resolution Methods', data: genPieData(['AI Auto', 'Chatbot', 'Manual', 'Hybrid']) },
      ]
    },
    {
      id: 'governance', label: 'AI Governance',
      metrics: [
        { label: 'Bias Detection Score', value: '0.08', trend: -5.2 },
        { label: 'Fairness Index', value: '0.92', trend: 2.1 },
        { label: 'Explainability Score', value: '0.85', trend: 3.4 },
        { label: 'Compliance Score', value: '94.5', suffix: '%', trend: 1.8 },
        { label: 'Data Quality Score', value: '91.2', suffix: '%', trend: 2.5 },
        { label: 'AI Usage Adoption Rate', value: '67.8', suffix: '%', trend: 15.3 },
        { label: 'Decision Support Usage', value: '58.4', suffix: '%', trend: 8.7 },
      ],
      charts: [
        { type: 'bar', title: 'Governance Metrics', data: genBarData(['Bias', 'Fairness', 'Explain.', 'Compliance', 'Quality'], 70, 98), color: '#8B5CF6', span: 2 },
      ]
    },
  ], []);

  return <DashboardTemplate title="AI Insight Dashboard" subtitle="Predictive + Prescriptive Intelligence" level="Level 1 - Strategic" tabs={tabs} />;
}
