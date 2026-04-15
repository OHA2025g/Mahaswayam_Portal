import React, { useMemo } from 'react';
import DashboardTemplate from '@/components/DashboardTemplate';
import { genTimeSeries, genBarData, genPieData, genGroupedData, SKILLS, r } from '@/data/mockGenerators';

export default function StudentDashboard() {
  const tabs = useMemo(() => [
    {
      id: 'profile', label: 'Profile & Skills',
      metrics: [
        { label: 'Profile Completion', value: '85', suffix: '%', trend: 5.2 },
        { label: 'Skills Added', value: '12', trend: 3 },
        { label: 'Resume Score', value: '72', suffix: '/100', trend: 8.5 },
        { label: 'Portfolio Score', value: '68', suffix: '/100', trend: 4.2 },
        { label: 'Skill Gap Score', value: '0.32', trend: -5.8 },
        { label: 'AI Match Score', value: '78', suffix: '/100', trend: 4.5 },
      ],
      progress: [
        { label: 'Personal Info', value: 100 },
        { label: 'Education', value: 90 },
        { label: 'Skills', value: 75 },
        { label: 'Experience', value: 60 },
      ],
      charts: [
        { type: 'horizontal', title: 'Skill Proficiency', data: genBarData(SKILLS.slice(0, 8), 30, 95), color: '#2563EB' },
        { type: 'pie', title: 'Skill Category Distribution', data: genPieData(['Technical', 'Soft Skills', 'Domain', 'Tools', 'Language']) },
      ]
    },
    {
      id: 'learning', label: 'Learning',
      metrics: [
        { label: 'Courses Enrolled', value: '8', trend: 2 },
        { label: 'Courses Completed', value: '5', trend: 1 },
        { label: 'Certifications Earned', value: '3', trend: 1 },
        { label: 'Learning Hours', value: '124', suffix: 'hrs', trend: 15 },
        { label: 'Attendance', value: '82.5', suffix: '%', trend: 3.2 },
        { label: 'Assignment Score', value: '78', suffix: '/100', trend: 5.8 },
      ],
      progress: [
        { label: 'Web Development', value: 85 },
        { label: 'Data Analytics', value: 60 },
        { label: 'Digital Marketing', value: 40 },
        { label: 'Communication Skills', value: 90 },
      ],
      charts: [
        { type: 'area', title: 'Weekly Learning Hours', data: genBarData(['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12'], 2, 12), color: '#6366F1' },
        { type: 'bar', title: 'Course Progress', data: genBarData(['Web Dev', 'Analytics', 'Dig. Mkt', 'Comm.', 'English'], 30, 90), color: '#10B981' },
      ]
    },
    {
      id: 'job-search', label: 'Job Search',
      metrics: [
        { label: 'Job Applications', value: '24', trend: 5 },
        { label: 'Interview Calls', value: '8', trend: 3 },
        { label: 'Offers Received', value: '2', trend: 1 },
        { label: 'Placement Status', value: 'Interviewing', trend: null },
        { label: 'Salary Offered', value: '18,500', trend: 7.2 },
        { label: 'Application Success Rate', value: '33.3', suffix: '%', trend: 4.5 },
      ],
      charts: [
        { type: 'bar', title: 'Application Status', data: [
          { name: 'Applied', value: 24 }, { name: 'Shortlisted', value: 12 },
          { name: 'Interviewed', value: 8 }, { name: 'Offered', value: 2 },
          { name: 'Rejected', value: 4 }
        ], color: '#2563EB' },
        { type: 'pie', title: 'Applications by Sector', data: genPieData(['IT', 'Finance', 'Healthcare', 'Retail', 'Manufacturing']) },
      ]
    },
    {
      id: 'performance', label: 'Performance',
      metrics: [
        { label: 'Engagement Score', value: '72', suffix: '/100', trend: 5.2 },
        { label: 'Daily Activity', value: '85', suffix: 'min', trend: 8 },
        { label: 'Consistency Score', value: '78', suffix: '%', trend: 4.5 },
        { label: 'Peer Ranking', value: '#45/320', trend: 12 },
        { label: 'Mentor Sessions', value: '6', trend: 2 },
        { label: 'Mock Interview Score', value: '74', suffix: '/100', trend: 8.5 },
      ],
      charts: [
        { type: 'line', title: 'Engagement Score Trend', data: genTimeSeries(70, 12), color: '#EC4899', span: 2 },
        { type: 'gauge', title: 'Overall Rating', value: 72, gaugeLabel: 'Score', color: '#2563EB' },
      ]
    },
    {
      id: 'activity', label: 'Activity & Goals',
      metrics: [
        { label: 'Login Streak', value: '14 days', trend: null },
        { label: 'Tasks Completed', value: '32/40', trend: 5 },
        { label: 'Forum Posts', value: '8', trend: 3 },
        { label: 'Event Participation', value: '4', trend: 2 },
        { label: 'Referrals Made', value: '3', trend: 1 },
        { label: 'Badge Earned', value: '5', trend: 2 },
        { label: 'Career Goal Progress', value: '65', suffix: '%', trend: 8 },
        { label: 'Counselor Sessions', value: '2', trend: 1 },
      ],
      progress: [
        { label: 'Complete Profile', value: 85 },
        { label: 'Earn 5 Certificates', value: 60 },
        { label: 'Apply to 30 Jobs', value: 80 },
        { label: 'Attend 5 Events', value: 80 },
      ],
      charts: [
        { type: 'area', title: 'Daily Activity Minutes', data: genBarData(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], 30, 120), color: '#F59E0B' },
      ]
    },
  ], []);

  return <DashboardTemplate title="Student Dashboard" subtitle="Profile, Skills, Learning Progress & Job Search" level="Level 4 - End User" tabs={tabs} />;
}
