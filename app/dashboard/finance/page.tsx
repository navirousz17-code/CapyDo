'use client';
// app/dashboard/finance/page.tsx

import './finance.css';
import { useEffect, useState } from 'react';
import {
  Plus, X, Trash2, TrendingUp, TrendingDown,
  Loader2, ChevronRight, Calendar, Check,
} from 'lucide-react';
import {
  useFinanceStore,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  getCategoryMeta,
  TxType,
} from '@/hooks/useFinanceStore';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';

const T = {
  cream:       '#F2EDE3',
  card:        '#FDFAF4',
  mossBorder:  '#C8D9AE',
  olive:       '#3A2E0F',
  oliveMid:    '#5C4A1E',
  oliveFaint:  '#F5EDD6',
  inkDark:     '#1E1408',
  inkMid:      '#5A4E3A',
  inkFaint:    '#8A7A62',
  green:       '#4A7C40',
  greenBg:     '#EAF2E0',
  greenBorder: '#BEDDA8',
  red:         '#B84020',
  redBg:       '#FBF0EC',
  redBorder:   '#E8C4B4',
  border:      '#E4D9C8',
};

function fmt(n: number) {
  const abs = Math.abs(n).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${n < 0 ? '-' : ''}₱${abs}`;
}

function ChartTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { name?: string; value?: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: '10px 14px', fontSize: 13 }}>
      <p style={{ fontWeight: 700, marginBottom: 6, color: T.inkDark }}>{label}</p>
      {payload.map((p: { name?: string; value?: number }) => (
        <p key={p.name} style={{ color: p.name === 'income' ? T.green : T.red, marginBottom: 2 }}>
          {p.name === 'income' ? 'Income' : 'Expense'}: {fmt(p.value as number)}
        </p>
      ))}
    </div>
  );
}

function AddTransactionModal({ onClose }: { onClose: () => void }) {
  const { createTransaction } = useFinanceStore();
  const [type, setType]         = useState<TxType>('expense');
  const [amount, setAmount]     = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0].id);
  const [note, setNote]         = useState('');
  const [date, setDate]         = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving]     = useState(false);

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleTypeChange = (t: TxType) => {
    setType(t);
    setCategory(t === 'income' ? INCOME_CATEGORIES[0].id : EXPENSE_CATEGORIES[0].id);
  };

  const handleSubmit = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;
    setSaving(true);
    await createTransaction({ type, amount: amt, category, note: note.trim() || undefined, occurred_at: date });
    setSaving(false);
    onClose();
  };

  const isExpense = type === 'expense';
  const modalCapy = isExpense ? '/capy_finance_saving.png' : '/capy_finance_celebrate.png';
  const accentColor = isExpense ? T.red : T.green;
  const accentBg = isExpense ? T.redBg : T.greenBg;
  const accentBorder = isExpense ? T.redBorder : T.greenBorder;

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(20,14,4,0.55)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="fin-modal-in fin-card" style={{ width: '100%', maxWidth: 440, padding: 0, overflow: 'hidden' }}>

        {/* ── capy hero banner ── */}
        <div style={{
          background: accentBg,
          border: `0 0 1px 0 solid ${accentBorder}`,
          borderBottom: `1px solid ${accentBorder}`,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          paddingTop: 20, paddingBottom: 0,
          position: 'relative',
        }}>
          {/* close btn */}
          <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(255,255,255,0.6)', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} color={T.inkMid} />
          </button>

          <img
            src={modalCapy} alt=""
            width={160} height={160}
            className="capy-bounce"
            style={{ objectFit: 'contain', marginBottom: -8 }}
          />
          <div style={{ textAlign: 'center', paddingBottom: 16 }}>
            <h2 style={{ fontFamily: "'Baloo 2', cursive", fontSize: 22, fontWeight: 800, color: T.inkDark, marginBottom: 2 }}>
              {isExpense ? 'Log an Expense' : 'Log Income'}
            </h2>
            <p style={{ fontSize: 12, color: T.inkFaint, fontWeight: 500 }}>
              {isExpense ? 'Where did your money go?' : 'Nice, money coming in! 🎉'}
            </p>
          </div>
        </div>

        {/* ── form body ── */}
        <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* type toggle */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, background: '#EDE5D0', borderRadius: 12, padding: 4 }}>
            {(['expense', 'income'] as const).map((t) => {
              const active = type === t;
              return (
                <button key={t} onClick={() => handleTypeChange(t)} style={{ padding: '9px 0', borderRadius: 9, border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.15s', background: active ? (t === 'expense' ? T.red : T.green) : 'transparent', color: active ? '#fff' : T.inkMid }}>
                  {t === 'expense' ? <TrendingDown size={15} /> : <TrendingUp size={15} />}
                  {t === 'expense' ? 'Expense' : 'Income'}
                </button>
              );
            })}
          </div>

          {/* amount — big and prominent */}
          <div style={{ background: accentBg, border: `1.5px solid ${accentBorder}`, borderRadius: 14, padding: '14px 16px' }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: accentColor, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Amount</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ fontFamily: "'Baloo 2', cursive", fontWeight: 800, color: accentColor, fontSize: 28, marginRight: 4, lineHeight: 1 }}>₱</span>
              <input
                style={{ fontFamily: "'Baloo 2', cursive", fontWeight: 800, fontSize: 36, color: accentColor, background: 'transparent', border: 'none', outline: 'none', width: '100%', lineHeight: 1 }}
                type="number" inputMode="decimal" step="0.01" min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          {/* category chips */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: T.inkFaint, display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Category</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {categories.map((c) => {
                const active = category === c.id;
                return (
                  <button key={c.id} onClick={() => setCategory(c.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 13px', borderRadius: 999, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: active ? 'none' : `1.5px solid ${T.border}`, background: active ? c.color : '#F5EDD6', color: active ? '#fff' : T.inkMid, transition: 'all 0.15s' }}>
                    <span>{c.icon}</span> {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* date + note side by side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: T.inkFaint, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Date</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                  <Calendar size={13} color={T.inkFaint} />
                </span>
                <input className="fin-input" style={{ paddingLeft: 28, fontSize: 13 }} type="date" value={date} onChange={(e) => setDate(e.target.value)} max={new Date().toISOString().split('T')[0]} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: T.inkFaint, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Note</label>
              <input className="fin-input" style={{ fontSize: 13 }} type="text" placeholder="optional" value={note} onChange={(e) => setNote(e.target.value)} maxLength={100} />
            </div>
          </div>

          {/* actions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10, marginTop: 4 }}>
            <button className="fin-btn-secondary" onClick={onClose}>Cancel</button>
            <button
              className="fin-btn-primary"
              style={{ justifyContent: 'center', background: accentColor }}
              onClick={handleSubmit}
              disabled={saving || !amount || parseFloat(amount) <= 0}
            >
              {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={16} />}
              {saving ? 'Saving…' : `Save ${isExpense ? 'Expense' : 'Income'}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FinancePage() {
  const { transactions, loading, fetchTransactions, deleteTransaction, getStats } = useFinanceStore();
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => { fetchTransactions(); }, []);

  const stats     = getStats();
  const recent    = transactions.slice(0, 10);
  const chartData = stats.last7Days.map((d) => ({ day: d.label, income: d.income, expense: d.expense }));
  const balanceCapy = stats.balance >= 0 ? '/capy_finance_celebrate.png' : '/capy_finance_saving.png';

  return (
    <div className="fin-root" style={{ padding: '0 0 48px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* header */}
        <div className="fin-fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 4px 4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img src="/wallet_logo.png" alt="" width={52} height={52} style={{ objectFit: 'contain' }} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
            <div>
              <h1 style={{ fontFamily: "'Baloo 2', cursive", fontSize: 28, fontWeight: 800, color: T.inkDark, lineHeight: 1.1, letterSpacing: '-0.5px' }}>Finance</h1>
              <p style={{ fontSize: 13, color: T.inkFaint, marginTop: 2, fontWeight: 500 }}>Track your spending and stay on budget.</p>
            </div>
          </div>
          <button className="fin-btn-primary" onClick={() => setShowAdd(true)}><Plus size={16} /> Add</button>
        </div>

        {/* balance card */}
        <div className="fin-fade-up" style={{ background: '#E8EDD8', backgroundImage: 'url(/paper_noise.png)', backgroundRepeat: 'repeat', backgroundSize: '512px 512px', border: `1px solid ${T.mossBorder}`, borderRadius: 20, padding: 20, animationDelay: '0.05s', position: 'relative', overflow: 'hidden' }}>
          <img src={balanceCapy} alt="" width={110} height={110} className="capy-bounce" style={{ position: 'absolute', right: 12, top: 12, objectFit: 'contain', pointerEvents: 'none' }} />
          <p style={{ fontSize: 13, fontWeight: 600, color: '#5C6B4A', marginBottom: 4 }}>Total Balance</p>
          <p style={{ fontFamily: "'Baloo 2', cursive", fontSize: 42, fontWeight: 800, color: stats.balance < 0 ? T.red : '#1E2D12', letterSpacing: '-1px', marginBottom: 18, lineHeight: 1, maxWidth: '65%' }}>
            {fmt(stats.balance)}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ background: T.greenBg, border: `1px solid ${T.greenBorder}`, borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#C5D9A0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><TrendingUp size={18} color={T.green} /></div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#5C7A4A', marginBottom: 3 }}>Income this month</p>
                <p style={{ fontFamily: "'Baloo 2', cursive", fontSize: 17, fontWeight: 800, color: T.green }}>{fmt(stats.monthIncome)}</p>
              </div>
            </div>
            <div style={{ background: T.redBg, border: `1px solid ${T.redBorder}`, borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#E8B4A0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><TrendingDown size={18} color={T.red} /></div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#8A5040', marginBottom: 3 }}>Expenses this month</p>
                <p style={{ fontFamily: "'Baloo 2', cursive", fontSize: 17, fontWeight: 800, color: T.red }}>{fmt(stats.monthExpense)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 7-day chart */}
        <div className="fin-card fin-fade-up" style={{ animationDelay: '0.1s' }}>
          <h2 style={{ fontFamily: "'Baloo 2', cursive", fontSize: 18, fontWeight: 800, color: T.inkDark, marginBottom: 16 }}>Last 7 Days</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} barGap={4} barSize={13} margin={{ top: 8, right: 4, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: T.inkFaint, fontWeight: 600 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: T.inkFaint }} tickFormatter={(v: number) => `₱${v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v}`} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(90,78,58,0.05)', radius: 6 }} />
              <Bar dataKey="income" fill={T.green} radius={[5, 5, 0, 0]} name="income" />
              <Bar dataKey="expense" fill={T.red} radius={[5, 5, 0, 0]} name="expense" />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: 20, marginTop: 10 }}>
            {[['income', T.green, 'Income'], ['expense', T.red, 'Expenses']].map(([, color, label]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, fontWeight: 600, color: T.inkFaint }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: color as string, display: 'inline-block' }} />{label}
              </div>
            ))}
          </div>
        </div>

        {/* category breakdown */}
        {stats.categoryBreakdown?.length > 0 && (
          <div className="fin-card fin-fade-up" style={{ animationDelay: '0.15s' }}>
            <h2 style={{ fontFamily: "'Baloo 2', cursive", fontSize: 18, fontWeight: 800, color: T.inkDark, marginBottom: 16 }}>Spending by Category</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {stats.categoryBreakdown.map((c) => {
                const pct = stats.monthExpense > 0 ? Math.round((c.amount / stats.monthExpense) * 100) : 0;
                return (
                  <div key={c.category}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 13, color: T.inkDark }}>
                        <span style={{ width: 32, height: 32, borderRadius: 9, background: c.meta.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{c.meta.icon}</span>
                        {c.meta.label}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: T.inkMid }}>{fmt(c.amount)}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: c.meta.color, minWidth: 32, textAlign: 'right' }}>{pct}%</span>
                      </div>
                    </div>
                    <div style={{ height: 7, borderRadius: 999, background: '#EDE5D0', overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 999, background: c.meta.color, width: `${pct}%`, transition: 'width 0.7s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* recent transactions */}
        <div className="fin-card fin-fade-up" style={{ animationDelay: '0.2s' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontFamily: "'Baloo 2', cursive", fontSize: 18, fontWeight: 800, color: T.inkDark }}>Recent Transactions</h2>
            {recent.length > 0 && (
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: T.oliveMid, display: 'flex', alignItems: 'center', gap: 3 }}>
                View all <ChevronRight size={14} />
              </button>
            )}
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[1, 2, 3].map((i) => <div key={i} className="fin-shimmer" />)}
            </div>
          ) : recent.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0 40px' }}>
              <img src="/capy_finance_idle.png" alt="No transactions yet" width={140} height={140} style={{ margin: '0 auto 8px', display: 'block', objectFit: 'contain' }} />
              <img src="/empty_transactions.png" alt="" width={80} height={80} style={{ margin: '0 auto 14px', display: 'block', objectFit: 'contain', opacity: 0.85 }} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
              <p style={{ fontWeight: 700, color: T.inkMid, fontSize: 15 }}>No transactions yet</p>
              <p style={{ fontSize: 13, color: T.inkFaint, marginTop: 4 }}>Add your first one to get started!</p>
              <button className="fin-btn-primary" style={{ marginTop: 16 }} onClick={() => setShowAdd(true)}><Plus size={14} /> Add Transaction</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {recent.map((tx) => {
                const meta    = getCategoryMeta(tx.type, tx.category);
                const dateStr = new Date(tx.occurred_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                return (
                  <div key={tx.id} className="fin-tx-row">
                    <div style={{ width: 44, height: 44, borderRadius: 13, background: meta.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{meta.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: 14, color: T.inkDark, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.note || meta.label}</p>
                      <p style={{ fontSize: 12, color: T.inkFaint }}>{meta.label} · {dateStr}</p>
                    </div>
                    <span style={{ fontFamily: "'Baloo 2', cursive", fontWeight: 800, fontSize: 15, color: tx.type === 'income' ? T.green : T.red, flexShrink: 0 }}>
                      {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
                    </span>
                    <button className="fin-tx-delete" onClick={() => deleteTransaction(tx.id)} title="Delete"><Trash2 size={14} /></button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
      {showAdd && <AddTransactionModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}