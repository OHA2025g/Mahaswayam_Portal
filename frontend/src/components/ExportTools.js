import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function exportToPDF(elementId, title = 'Dashboard Report') {
  const element = document.getElementById(elementId);
  if (!element) return;

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#F8FAFC',
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
    unit: 'px',
    format: [canvas.width, canvas.height],
  });

  pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
  pdf.save(`${title.replace(/[\s\/]/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function exportToCSV(data, filename = 'dashboard_export') {
  if (!data || !data.length) return;

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row =>
      headers.map(h => {
        const val = row[h];
        const str = val === null || val === undefined ? '' : String(val);
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? `"${str.replace(/"/g, '""')}"`
          : str;
      }).join(',')
    ),
  ];

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function collectTabData(tab) {
  const rows = [];

  if (tab.metrics) {
    tab.metrics.forEach(m => {
      rows.push({
        Type: 'KPI',
        Category: tab.label,
        Label: m.label,
        Value: m.value,
        Suffix: m.suffix || '',
        Trend: m.trend !== undefined && m.trend !== null ? `${m.trend}%` : '',
      });
    });
  }

  if (tab.alerts) {
    tab.alerts.forEach(a => {
      rows.push({
        Type: 'Alert',
        Category: tab.label,
        Label: a.label,
        Value: a.value,
        Suffix: '',
        Trend: a.severity || '',
      });
    });
  }

  if (tab.progress) {
    tab.progress.forEach(p => {
      rows.push({
        Type: 'Progress',
        Category: tab.label,
        Label: p.label,
        Value: p.value,
        Suffix: '%',
        Trend: '',
      });
    });
  }

  if (tab.charts) {
    tab.charts.forEach(c => {
      if (c.data && Array.isArray(c.data)) {
        c.data.forEach(d => {
          const row = { Type: 'Chart Data', Category: `${tab.label} - ${c.title}` };
          Object.entries(d).forEach(([k, v]) => { row[k] = v; });
          rows.push(row);
        });
      }
    });
  }

  return rows;
}
