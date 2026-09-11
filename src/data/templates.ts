/* ============================================================
 * 参数模板库 + 计算引擎
 * 移植自 lims-test-app.html 第 524-645 行。
 * ============================================================ */

export type StepInputType = 'number' | 'select';

export interface StepInput {
  label: string;
  unit?: string;
  type: StepInputType;
  def?: string | number;
  options?: string[];
  value?: string | number | null;
}

export interface StepDef {
  name: string;
  method: string;
  inst: string;
  inputs: StepInput[];
}

export interface ResultItem {
  name: string;
  val: string | number;
  unit: string;
  std: string;
  pass: boolean;
}

export interface ComputeResult {
  items: ResultItem[];
  conclusion: '合格' | '不合格';
  note: string;
}

export type TemplateKey = 'conc' | 'steel' | 'bend' | 'pile';

export interface Template {
  key: TemplateKey;
  name: string;
  std: string;
  judge: string;
  buildSteps: (qty?: string) => StepDef[];
}

/* -------- 基础工具 -------- */
export function round1(x: number): number {
  return Math.round(x * 10) / 10;
}

export function seqInputs<T>(n: number, fn: (i: number) => T): T[] {
  const a: T[] = [];
  for (let i = 0; i < n; i++) a.push(fn(i));
  return a;
}

export function inputVal(inp: StepInput): string {
  return inp.value != null && inp.value !== '' ? String(inp.value) : inp.def != null ? String(inp.def) : '';
}

/* ================= 参数模板库 ================= */
export const TEMPLATES: Record<TemplateKey, Template> = {
  conc: {
    key: 'conc',
    name: '混凝土抗压强度',
    std: 'GB/T 50081-2019',
    judge: 'GB/T 50107-2010',
    buildSteps(): StepDef[] {
      return [
        {
          name: '试块尺寸检查',
          method: 'GB/T 50081-2019 §5.2',
          inst: '钢直尺 300mm（YQ-0034）',
          inputs: seqInputs(9, (i) => ({ label: `第${i + 1}块平均边长`, unit: 'mm', type: 'number', def: 150 })),
        },
        {
          name: '抗压试验（3组×3块）',
          method: 'GB/T 50081-2019 §5.3',
          inst: '2000kN压力试验机（YQ-0102）',
          inputs: seqInputs(9, (i) => ({ label: `第${i + 1}块破坏荷载`, unit: 'kN', type: 'number' })),
        },
        { name: '数据处理与修约', method: '系统自动计算（GB/T 8170 修约）', inst: '—', inputs: [] },
      ];
    },
  },
  steel: {
    key: 'steel',
    name: '钢材力学性能（屈服/抗拉/伸长率）',
    std: 'GB/T 228.1-2021',
    judge: 'GB/T 1499.2-2018',
    buildSteps(): StepDef[] {
      const pull: StepInput[] = [];
      for (let i = 0; i < 3; i++) {
        pull.push({ label: `试件${i + 1}屈服力`, unit: 'kN', type: 'number' });
        pull.push({ label: `试件${i + 1}最大力`, unit: 'kN', type: 'number' });
        pull.push({ label: `试件${i + 1}断后标距`, unit: 'mm', type: 'number' });
      }
      return [
        {
          name: '试件制备与标距刻画',
          method: 'GB/T 228.1-2021 §7',
          inst: '钢直尺、标距打点机',
          inputs: [
            { label: '原始标距 L₀', unit: 'mm', type: 'number', def: 110 },
            { label: '试件数量', unit: '根', type: 'number', def: 3 },
          ],
        },
        { name: '拉伸试验（3根）', method: 'GB/T 228.1-2021 §8', inst: '600kN万能试验机（YQ-0056）', inputs: pull },
        {
          name: '冷弯试验',
          method: 'GB/T 232-2010',
          inst: '600kN万能试验机（YQ-0056）',
          inputs: [{ label: '弯曲后外表面（d=4a，180°）', type: 'select', options: ['无裂纹', '有裂纹'] }],
        },
      ];
    },
  },
  bend: {
    key: 'bend',
    name: '冷弯性能',
    std: 'GB/T 232-2010',
    judge: 'GB/T 1499.2-2018',
    buildSteps(): StepDef[] {
      return [
        {
          name: '冷弯试验',
          method: 'GB/T 232-2010',
          inst: '600kN万能试验机（YQ-0056）',
          inputs: [{ label: '弯曲后外表面（d=4a，180°）', type: 'select', options: ['无裂纹', '有裂纹'] }],
        },
      ];
    },
  },
  pile: {
    key: 'pile',
    name: '基桩完整性（声波透射法）',
    std: 'JGJ 106-2014',
    judge: 'JGJ 106-2014',
    buildSteps(qty?: string): StepDef[] {
      let n = parseInt(String(qty || '').replace(/[^0-9]/g, ''), 10);
      if (!n || n < 1) n = 3;
      if (n > 5) n = 5;
      return seqInputs(n, (i) => ({
        name: `桩${i + 1}# 声波检测`,
        method: 'JGJ 106-2014 §10',
        inst: '超声检测仪（YQ-0207）',
        inputs: [
          { label: '平均波速', unit: 'm/s', type: 'number', def: 3800 },
          { label: '完整性类别', type: 'select', options: ['Ⅰ类', 'Ⅱ类', 'Ⅲ类', 'Ⅳ类'], def: 'Ⅰ类' },
        ],
      }));
    },
  },
};

/* ================= 计算引擎 ================= */
export function computeConc(steps: StepDef[]): ComputeResult {
  const loads = steps[1].inputs.map((i) => +inputVal(i) || 0);
  const fcs = loads.map((f) => round1((f * 1000) / 22500));
  const g = [0, 1, 2].map((j) => round1((fcs[3 * j] + fcs[3 * j + 1] + fcs[3 * j + 2]) / 3));
  const mean = round1(fcs.reduce((a, b) => a + b, 0) / 9);
  const mn = Math.min(...fcs);
  const items: ResultItem[] = [
    { name: '组1平均抗压强度', val: g[0], unit: 'MPa', std: '≥47.5 MPa', pass: g[0] >= 47.5 },
    { name: '组2平均抗压强度', val: g[1], unit: 'MPa', std: '≥47.5 MPa', pass: g[1] >= 47.5 },
    { name: '组3平均抗压强度', val: g[2], unit: 'MPa', std: '≥47.5 MPa', pass: g[2] >= 47.5 },
    { name: '单块最小强度', val: mn, unit: 'MPa', std: '≥45.0 MPa', pass: mn >= 45 },
  ];
  const ok = items.every((x) => x.pass);
  return {
    items,
    conclusion: ok ? '合格' : '不合格',
    note: `9块单块强度 ${fcs.join(' / ')} MPa（修约至0.1MPa）；三组平均 ${g.join(' / ')} MPa，总平均 ${mean} MPa。判定依据 GB/T 50107-2010（组平均≥0.95×50MPa 且单块≥0.90×50MPa）。`,
  };
}

export function computeSteel(steps: StepDef[]): ComputeResult {
  const L0 = +inputVal(steps[0].inputs[0]) || 110;
  const v = steps[1].inputs.map((i) => +inputVal(i) || 0);
  const area = 380.1; /* Φ22 截面积 mm² */
  const rel: number[] = [];
  const rm: number[] = [];
  const ag: number[] = [];
  for (let i = 0; i < 3; i++) {
    rel.push(round1((v[3 * i] * 1000) / area));
    rm.push(round1((v[3 * i + 1] * 1000) / area));
    ag.push(round1(((v[3 * i + 2] - L0) / L0) * 100));
  }
  const aRel = round1((rel[0] + rel[1] + rel[2]) / 3);
  const aRm = round1((rm[0] + rm[1] + rm[2]) / 3);
  const aAg = round1((ag[0] + ag[1] + ag[2]) / 3);
  const bend = inputVal(steps[2].inputs[0]) || '无裂纹';
  const items: ResultItem[] = [
    { name: '屈服强度 ReL', val: aRel, unit: 'MPa', std: '≥400 MPa', pass: aRel >= 400 },
    { name: '抗拉强度 Rm', val: aRm, unit: 'MPa', std: '≥540 MPa', pass: aRm >= 540 },
    { name: '断后伸长率 A', val: aAg, unit: '%', std: '≥17%', pass: aAg >= 17 },
    { name: '冷弯（d=4a，180°）', val: bend, unit: '', std: '外表面无裂纹', pass: bend === '无裂纹' },
  ];
  const ok = items.every((x) => x.pass);
  return {
    items,
    conclusion: ok ? '合格' : '不合格',
    note:
      `ReL 三根 ${rel.join('/')} MPa；Rm ${rm.join('/')} MPa；A ${ag.join('/')} %（L₀=${L0}mm，Φ22 截面积 380.1mm²）。判定依据 GB/T 1499.2-2018（HRB400E）。` +
      (ok ? '' : '存在低于标准下限的项目 → 该批钢材判定不合格，进入不合格台账，建议双倍取样复检，复检仍不合格则整批退货处理。'),
  };
}

export function computeBend(steps: StepDef[]): ComputeResult {
  const bend = inputVal(steps[0].inputs[0]) || '无裂纹';
  const ok = bend === '无裂纹';
  return {
    items: [{ name: '冷弯性能（d=4a，180°）', val: bend, unit: '', std: '弯曲外表面无裂纹', pass: ok }],
    conclusion: ok ? '合格' : '不合格',
    note: '弯心直径 d=4a=88mm，弯曲 180° 后迎光检查外表面。判定依据 GB/T 1499.2-2018。',
  };
}

export function computePile(steps: StepDef[]): ComputeResult {
  const clsOrder: Record<string, number> = { 'Ⅰ类': 1, 'Ⅱ类': 2, 'Ⅲ类': 3, 'Ⅳ类': 4 };
  let worst = 'Ⅰ类';
  const items: ResultItem[] = [];
  steps.forEach((s) => {
    const vel = +inputVal(s.inputs[0]) || 0;
    const c = inputVal(s.inputs[1]) || 'Ⅰ类';
    if (clsOrder[c] > clsOrder[worst]) worst = c;
    items.push({ name: s.name.replace(' 声波检测', ''), val: `${c}（波速 ${vel} m/s）`, unit: '', std: 'Ⅰ~Ⅱ类', pass: clsOrder[c] <= 2 });
  });
  const ok = clsOrder[worst] <= 2;
  let note = `按最不利原则，桩身完整性综合类别为 ${worst}。`;
  if (ok && worst === 'Ⅱ类') note += '存在轻微缺陷桩，报告正文需注明缺陷位置并建议加强观测。';
  if (!ok) note += '存在明显/严重缺陷桩，判定不合格，需上报并通知设计单位复核。';
  return { items, conclusion: ok ? '合格' : '不合格', note };
}

export const COMPUTE: Record<TemplateKey, (steps: StepDef[]) => ComputeResult> = {
  conc: computeConc,
  steel: computeSteel,
  bend: computeBend,
  pile: computePile,
};
