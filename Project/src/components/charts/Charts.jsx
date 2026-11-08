import { useState } from 'react';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { BarChart3, Table2 } from 'lucide-react';
import { Card, SectionHeading, TableShell } from '../ui/Primitives';
import { SKILL_LEVELS } from '../../constants';

// Palette checked with the colour-vision validator: blue and amber stay distinct for all readers.
const SERIES_PRIMARY = '#2563eb';
const SERIES_SECONDARY = '#d97706';
const GRID = '#e2e8f0';
const AXIS_TEXT = '#64748b';
const tick = { fill: AXIS_TEXT, fontSize: 12 };

function ChartTooltip({ active, payload, label, formatValue }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-raised">
      <p className="mb-1 font-semibold text-slate-900">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="flex items-center gap-2 text-slate-600">
          <span className="size-2 rounded-full" style={{ background: entry.color }} aria-hidden="true" />
          {entry.name}: <span className="font-semibold text-slate-900">{formatValue ? formatValue(entry.value) : entry.value}</span>
        </p>
      ))}
    </div>
  );
}

// A chart with a table view, so that the numbers are always readable without the graphic.
export function ChartCard({ title, description, table, children }) {
  const [showTable, setShowTable] = useState(false);
  const toggle = table && (
    <button
      type="button"
      onClick={() => setShowTable((value) => !value)}
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800"
    >
      {showTable ? <BarChart3 className="size-3.5" aria-hidden="true" /> : <Table2 className="size-3.5" aria-hidden="true" />}
      {showTable ? 'Chart' : 'Table'}
    </button>
  );

  return (
    <Card>
      <SectionHeading title={title} description={description} action={toggle} />
      {showTable ? (
        <TableShell>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs text-slate-500">
                {table.columns.map((column) => <th key={column} scope="col" className="py-2 pr-4 font-medium">{column}</th>)}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row) => (
                <tr key={row[0]} className="border-b border-slate-100 last:border-0">
                  {row.map((cell, index) => <td key={index} className="py-2 pr-4 text-slate-700">{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </TableShell>
      ) : children}
    </Card>
  );
}

export function TrendChart({ data, xKey, yKey, name }) {
  return (
    <div role="img" aria-label={`${name} over time`} className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -20 }}>
          <CartesianGrid vertical={false} stroke={GRID} />
          <XAxis dataKey={xKey} tick={tick} tickLine={false} axisLine={{ stroke: GRID }} minTickGap={16} />
          <YAxis allowDecimals={false} tick={tick} tickLine={false} axisLine={false} />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#94a3b8' }} />
          <Area type="monotone" dataKey={yKey} name={name} stroke={SERIES_PRIMARY} strokeWidth={2} fill={SERIES_PRIMARY} fillOpacity={0.1} dot={false} activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2 }} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function HorizontalBars({ data, labelKey, valueKey, name, labelWidth = 104 }) {
  const height = Math.max(data.length * 38 + 28, 120);
  return (
    <div role="img" aria-label={`${name} by ${labelKey}`} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 0 }} barCategoryGap={12}>
          <CartesianGrid horizontal={false} stroke={GRID} />
          <XAxis type="number" allowDecimals={false} tick={tick} tickLine={false} axisLine={false} />
          <YAxis type="category" dataKey={labelKey} width={labelWidth} tick={tick} tickLine={false} axisLine={{ stroke: GRID }} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f1f5f9' }} />
          <Bar dataKey={valueKey} name={name} fill={SERIES_PRIMARY} barSize={20} radius={[0, 4, 4, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

const levelName = (rank) => SKILL_LEVELS.find((level) => level.rank === rank)?.label ?? 'Not yet';

// Compares the candidate's level with the level a role requires, skill by skill.
export function SkillGapChart({ data }) {
  const height = Math.max(data.length * 54 + 56, 180);
  return (
    <div role="img" aria-label="Your skill levels compared with the required levels" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 0 }} barGap={2} barCategoryGap={10}>
          <CartesianGrid horizontal={false} stroke={GRID} />
          <XAxis
            type="number"
            domain={[0, 4]}
            ticks={[0, 1, 2, 3, 4]}
            tickFormatter={(value) => (value === 0 ? '' : levelName(value).slice(0, 3))}
            tick={tick}
            tickLine={false}
            axisLine={false}
          />
          <YAxis type="category" dataKey="skill" width={118} tick={tick} tickLine={false} axisLine={{ stroke: GRID }} />
          <Tooltip content={<ChartTooltip formatValue={levelName} />} cursor={{ fill: '#f1f5f9' }} />
          <Legend
            verticalAlign="top"
            align="left"
            height={32}
            iconType="circle"
            iconSize={8}
            itemSorter={null}
            wrapperStyle={{ fontSize: 12 }}
            formatter={(value) => <span style={{ color: '#334155' }}>{value}</span>}
          />
          <Bar dataKey="current" name="Your level" fill={SERIES_PRIMARY} barSize={14} radius={[0, 4, 4, 0]} isAnimationActive={false} />
          <Bar dataKey="required" name="Required" fill={SERIES_SECONDARY} barSize={14} radius={[0, 4, 4, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
