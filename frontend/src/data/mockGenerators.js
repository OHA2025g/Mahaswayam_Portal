// Mock data generators for all dashboards
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DISTRICTS = ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad', 'Solapur', 'Kolhapur', 'Sangli', 'Satara', 'Ratnagiri', 'Amravati'];
const SCHEMES = ['PMKVY', 'DDU-GKY', 'NULM', 'NSDC', 'Kaushalya', 'MahaRojgar', 'State Skills', 'MGNF'];
const SKILLS = ['Data Analytics', 'Digital Marketing', 'Web Dev', 'Nursing', 'Electrician', 'CNC Op', 'Tally', 'AutoCAD', 'Welding', 'Plumbing'];
const SECTORS = ['IT/ITES', 'Manufacturing', 'Healthcare', 'Agriculture', 'Construction', 'Retail', 'Banking', 'Hospitality'];

const r = (min, max) => Math.round(min + Math.random() * (max - min));
const rDec = (min, max, dec = 1) => +(min + Math.random() * (max - min)).toFixed(dec);

export const genTimeSeries = (base = 500, variance = 200, months = 12) =>
  MONTHS.slice(0, months).map((m, i) => ({ name: m, value: r(base - variance/2, base + variance/2) + i * r(5, 20) }));

export const genBarData = (labels, min = 50, max = 100) =>
  labels.map(l => ({ name: l, value: r(min, max) }));

export const genGroupedData = (labels, keys, min = 20, max = 80) =>
  labels.map(l => {
    const item = { name: l };
    keys.forEach(k => { item[k] = r(min, max); });
    return item;
  });

export const genPieData = (labels) => {
  const raw = labels.map(() => r(10, 100));
  const total = raw.reduce((a, b) => a + b, 0);
  return labels.map((l, i) => ({ name: l, value: Math.round((raw[i] / total) * 100) }));
};

export const genFunnel = (stages) => {
  let val = r(80000, 120000);
  return stages.map(s => {
    const item = { name: s, value: val };
    val = Math.round(val * rDec(0.6, 0.85));
    return item;
  });
};

export { MONTHS, DISTRICTS, SCHEMES, SKILLS, SECTORS, r, rDec };
