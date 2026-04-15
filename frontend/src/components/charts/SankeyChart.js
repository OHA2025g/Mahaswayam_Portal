import React, { useMemo, useState } from 'react';

const NODE_COLORS = ['#2563EB', '#10B981', '#F59E0B', '#6366F1', '#EC4899', '#0EA5E9', '#8B5CF6', '#F97316', '#14B8A6'];

function formatNum(n) {
  if (n >= 100000) return `${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

export function SankeyChart({ nodes, links, height = 420 }) {
  const [hoveredLink, setHoveredLink] = useState(null);

  const layout = useMemo(() => {
    if (!nodes?.length || !links?.length) return null;

    // Group nodes into columns
    const colMap = {};
    nodes.forEach(n => {
      const c = n.col ?? 0;
      if (!colMap[c]) colMap[c] = [];
      colMap[c].push(n);
    });
    const columns = Object.keys(colMap).sort((a, b) => Number(a) - Number(b));
    const numCols = columns.length;

    // Layout dimensions — generous padding so labels never clip
    const padLeft = 16;
    const padRight = 90;   // room for last-column labels
    const padTop = 16;
    const padBottom = 16;
    const W = 900;
    const drawW = W - padLeft - padRight;
    const drawH = height - padTop - padBottom;
    const nodeW = 14;
    const nodeGap = 8;
    const colSpacing = numCols > 1 ? (drawW - nodeW) / (numCols - 1) : 0;

    // Assign node colour by id for consistency
    const colorMap = {};
    let ci2 = 0;
    nodes.forEach(n => { colorMap[n.id] = NODE_COLORS[ci2++ % NODE_COLORS.length]; });

    // Calculate node positions — each column's nodes fill the available height proportionally
    const nodePos = {};
    columns.forEach((col, ci) => {
      const cNodes = colMap[col];
      const totalVal = cNodes.reduce((s, n) => s + n.value, 0);
      const gaps = (cNodes.length - 1) * nodeGap;
      const availH = drawH - gaps;
      let y = padTop;

      cNodes.forEach(n => {
        const h = Math.max(14, (n.value / totalVal) * availH);
        nodePos[n.id] = {
          x: padLeft + ci * colSpacing,
          y,
          w: nodeW,
          h,
          node: n,
          color: colorMap[n.id],
          isLastCol: ci === numCols - 1,
          isFirstCol: ci === 0,
        };
        y += h + nodeGap;
      });
    });

    // Pre-compute running offsets per node so links stack correctly
    const srcOffset = {};   // how much of the source node's height is consumed
    const tgtOffset = {};

    const linkPaths = links.map((link, li) => {
      const src = nodePos[link.source];
      const tgt = nodePos[link.target];
      if (!src || !tgt) return null;

      // Source: fraction of source node
      const srcTotalOut = links.filter(l => l.source === link.source).reduce((s, l) => s + l.value, 0);
      const srcH = (link.value / srcTotalOut) * src.h;
      const srcY = src.y + (srcOffset[link.source] || 0);
      srcOffset[link.source] = (srcOffset[link.source] || 0) + srcH;

      // Target: fraction of target node
      const tgtTotalIn = links.filter(l => l.target === link.target).reduce((s, l) => s + l.value, 0);
      const tgtH = (link.value / tgtTotalIn) * tgt.h;
      const tgtY = tgt.y + (tgtOffset[link.target] || 0);
      tgtOffset[link.target] = (tgtOffset[link.target] || 0) + tgtH;

      const sx = src.x + src.w;
      const tx = tgt.x;
      const mx = (sx + tx) / 2;

      const path = [
        `M${sx},${srcY}`,
        `C${mx},${srcY} ${mx},${tgtY} ${tx},${tgtY}`,
        `L${tx},${tgtY + tgtH}`,
        `C${mx},${tgtY + tgtH} ${mx},${srcY + srcH} ${sx},${srcY + srcH}`,
        'Z',
      ].join(' ');

      return { path, color: src.color, link, srcY, srcH, tgtY, tgtH, sx, tx };
    }).filter(Boolean);

    return { nodePos, linkPaths, W };
  }, [nodes, links, height]);

  if (!layout) return <div className="text-center text-slate-400 py-10">No data available</div>;

  return (
    <div data-testid="sankey-chart" className="relative w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${layout.W} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full"
        style={{ height: 'auto', maxHeight: height }}
      >
        {/* Links */}
        {layout.linkPaths.map((lp, i) => (
          <g key={i}>
            <path
              d={lp.path}
              fill={lp.color}
              fillOpacity={hoveredLink === i ? 0.55 : 0.2}
              stroke={hoveredLink === i ? lp.color : 'none'}
              strokeWidth={hoveredLink === i ? 1 : 0}
              className="transition-opacity duration-150 cursor-pointer"
              onMouseEnter={() => setHoveredLink(i)}
              onMouseLeave={() => setHoveredLink(null)}
            />
            {hoveredLink === i && (
              <text
                x={(lp.sx + lp.tx) / 2}
                y={(lp.srcY + lp.tgtY + lp.srcH) / 2 + 5}
                textAnchor="middle"
                fontSize={11}
                fontWeight={700}
                fill="#334155"
                className="pointer-events-none"
              >
                {formatNum(lp.link.value)}
              </text>
            )}
          </g>
        ))}

        {/* Nodes + Labels */}
        {Object.values(layout.nodePos).map((np) => {
          const labelX = np.isLastCol ? np.x - 6 : np.x + np.w + 6;
          const anchor = np.isLastCol ? 'end' : 'start';

          return (
            <g key={np.node.id}>
              <rect
                x={np.x}
                y={np.y}
                width={np.w}
                height={np.h}
                rx={3}
                fill={np.color}
                stroke="white"
                strokeWidth={1}
              />
              <text
                x={labelX}
                y={np.y + np.h / 2 - 5}
                textAnchor={anchor}
                dominantBaseline="middle"
                fontSize={11}
                fontWeight={600}
                fill="#334155"
                className="dark:fill-slate-300"
              >
                {np.node.name}
              </text>
              <text
                x={labelX}
                y={np.y + np.h / 2 + 9}
                textAnchor={anchor}
                dominantBaseline="middle"
                fontSize={10}
                fontWeight={500}
                fill="#94a3b8"
              >
                {formatNum(np.node.value)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function generateSankeyData() {
  const reg = 124568;
  const enrolled = Math.round(reg * 0.72);
  const trained = Math.round(enrolled * 0.76);
  const certified = Math.round(trained * 0.77);
  const placed = Math.round(certified * 0.65);
  const searching = certified - placed;
  const dropEnroll = reg - enrolled;
  const dropTrain = enrolled - trained;
  const dropCert = trained - certified;

  return {
    nodes: [
      { id: 'registered', name: 'Registered', value: reg, col: 0 },
      { id: 'enrolled', name: 'Enrolled', value: enrolled, col: 1 },
      { id: 'drop1', name: 'Drop (Reg)', value: dropEnroll, col: 1 },
      { id: 'trained', name: 'Trained', value: trained, col: 2 },
      { id: 'drop2', name: 'Drop (Enrl)', value: dropTrain, col: 2 },
      { id: 'certified', name: 'Certified', value: certified, col: 3 },
      { id: 'drop3', name: 'Drop (Train)', value: dropCert, col: 3 },
      { id: 'placed', name: 'Placed', value: placed, col: 4 },
      { id: 'searching', name: 'Searching', value: searching, col: 4 },
    ],
    links: [
      { source: 'registered', target: 'enrolled', value: enrolled },
      { source: 'registered', target: 'drop1', value: dropEnroll },
      { source: 'enrolled', target: 'trained', value: trained },
      { source: 'enrolled', target: 'drop2', value: dropTrain },
      { source: 'trained', target: 'certified', value: certified },
      { source: 'trained', target: 'drop3', value: dropCert },
      { source: 'certified', target: 'placed', value: placed },
      { source: 'certified', target: 'searching', value: searching },
    ],
  };
}
