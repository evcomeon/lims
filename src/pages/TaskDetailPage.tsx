/* 任务详情：检测执行（移植自 PAGES.taskDetail）
 * 步骤顺序依赖 · 原始记录 · 检测结果生成与判定 */
import React from 'react';
import { useLims } from '../context/LimsContext';
import { Chip } from '../components/ui';
import {
  get, recordOfTask, stepsOf, activeResult, paramNames,
  type Task, type Sample, type Step, type Result, type Entrust,
} from '../data/db';
import { inputVal } from '../data/templates';

export const TaskDetailPage: React.FC<{ arg?: string | null }> = ({ arg }) => {
  const { db, curUser, openTab, uiExecStep, uiGenResult, toast } = useLims();
  const tid = arg || '';
  const t = get<Task>(db, 'tasks', tid);
  if (!t) return <div className="empty"><div className="icon">🚫</div><div className="txt">任务不存在</div></div>;

  const sp = get<Sample>(db, 'samples', t.sampleId);
  const rc = recordOfTask(db, t.id);
  const steps: Step[] = rc ? stepsOf(db, rc.id) : [];
  const res: Result | null = rc ? activeResult(db, rc.id) : null;
  const isTester = t.tester === curUser;
  const canOper = isTester && (t.status === '已分配' || t.status === '检测中');
  const allDone = steps.length > 0 && steps.every(s => s.status === '已完成');

  return (
    <>
      <div className="card">
        <div className="det-head">
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span className="stc stc-blue">任</span><b style={{ color: '#5a6678' }}>检测任务</b>
            <Chip s={t.status} />
            {t.tester === curUser ? <span className="stc stc-blue">当前检测员：您</span> : null}
          </div>
          <div className="det-title">{t.no}</div>
          <div className="det-sub">
            {sp ? sp.name : ''}（{sp ? sp.no : ''}）· {paramNames(db, t)} · {t.dept} / {t.tester || '未分配'} · 仪器：{t.inst || '未配置'}
          </div>
        </div>
        <div className="section">
          <table className="kv"><tbody>
            <tr>
              <td className="k">所属委托单</td>
              <td className="v">
                <span className="flink" onClick={() => openTab('entrust:' + t.entrustId, '委托详情', 'entrustDetail', t.entrustId)}>
                  {(get<Entrust>(db, 'entrusts', t.entrustId))?.no || ''}
                </span>
              </td>
              <td className="k">分配日期/时限</td>
              <td className="v">{t.assignDate || '—'} / {t.dueDate || '—'}</td>
            </tr>
            <tr>
              <td className="k">原始记录</td>
              <td className="v">{rc ? <span className="flink" onClick={() => openTab('trace', '数据追溯', 'trace', rc.id)}>{rc.no}</span> : '—'}{rc ? ' · ' + rc.env : ''}</td>
              <td className="k">顺序依赖</td>
              <td className="v">步骤N未完成时，步骤N+1按钮禁用（非法跳转系统阻断）</td>
            </tr>
          </tbody></table>
        </div>
      </div>
      <div className="card steps-card">
        <div className="card-title">
          <span className="left">检测步骤（原始记录 {rc ? rc.no : '—'}）</span>
          <span className="right" onClick={() => toast('演示环境：修改留痕流程演示见钢材记录（伸长率修约 16.36%→16.4%）', 'info')}>修改留痕说明</span>
        </div>
        {steps.length ? steps.map((s, i) => {
          const locked = i > 0 && steps[i - 1].status !== '已完成' && s.status !== '已完成';
          const vals = s.inputs.map(inp => `${inp.label}=${inputVal(inp)}`).join(' · ');
          return (
            <div key={s.id} className={'step-row' + (s.status === '已完成' ? ' done' : '') + (locked ? ' locked' : '')}>
              <div className="sno">{s.seq}</div>
              <div className="sinfo">
                <div className="sname">{s.name}</div>
                <div className="smeta">{s.method} · 仪器：{s.inst}{s.executor ? ` · 执行人 ${s.executor} ${s.execTime}` : ''}</div>
                {s.status === '已完成' && vals ? <div className="svals">{vals}</div> : null}
              </div>
              <Chip s={s.status === '已完成' ? '已完成' : locked ? '已锁定' : '待执行'} />
              {s.status === '已完成' ? (
                <button className="btn sm" disabled>已完成</button>
              ) : canOper ? (
                <button className="btn sm primary" onClick={() => uiExecStep(s.id)}>执行 ▸</button>
              ) : (
                <button className="btn sm" disabled>不可执行</button>
              )}
            </div>
          );
        }) : <div className="empty">无步骤</div>}
      </div>
      {res ? (
        <div className="card">
          <div className="card-title">
            <span className="left">检测结果 · <Chip s={res.status} /></span>
            <span className="right" onClick={() => openTab('trace', '数据追溯', 'trace', res.id)}>追溯 →</span>
          </div>
          <div className="section">
            {res.items.map((it, idx) => (
              <div key={idx} className={'res-item' + (it.pass ? '' : ' fail')}>
                <span className="rn">{it.name}</span>
                <span className="rv">{it.val} {it.unit || ''}</span>
                <span className="rs">标准 {it.std} · {it.pass ? '符合' : <b className="fail-mark">不符合</b>}</span>
              </div>
            ))}
            <div className={'verdict' + (res.conclusion === '合格' ? ' pass' : ' fail')}>
              {res.conclusion === '合格' ? '✅ 检测结论：合格' : '❌ 检测结论：不合格（进入不合格台账）'}
            </div>
            <div style={{ fontSize: 11.5, color: '#8a94a6', lineHeight: 1.8 }}>{res.note}</div>
            <div style={{ fontSize: 11.5, color: '#8a94a6', marginTop: 6 }}>
              检测员：{res.tester} {res.genTime}{res.reviewer ? ` · 复核：${res.reviewer} ${res.reviewTime}` : ''}
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-title"><span className="left">检测结果</span></div>
          <div className="section" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Chip s="待生成" />
            <button className="btn success" disabled={!allDone || !canOper} onClick={() => uiGenResult(t.id)}>
              ⚙ 生成检测结果（自动计算+判定）
            </button>
            <span style={{ color: '#9aa3b2', fontSize: 11 }}>
              {!allDone ? '全部步骤完成后可用' : !isTester ? '仅任务检测员可生成' : '按标准自动计算并判定'}
            </span>
          </div>
        </div>
      )}
    </>
  );
};
