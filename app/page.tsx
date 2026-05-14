'use client'
import { useState, useEffect, useCallback, useMemo, ChangeEvent, MouseEvent } from 'react'

// ========== TYPE DEFINITIONS ==========
interface Expense {
  id: string
  description: string
  amount: number
  category: string
  date: string
  tags: string
  note: string
}

interface Income {
  id: string
  source: string
  amount: number
  category: string
  date: string
  note: string
}

interface Budget {
  id: string
  category: string
  amount: number
  period: string
}

interface Recurring {
  id: string
  description: string
  amount: number
  category: string
  frequency: string
  nextDate: string
  type: 'expense' | 'income'
  active: boolean
}

interface Note {
  id: string
  title: string
  body: string
  date: string
}

interface Goal {
  id: string
  name: string
  target: number
  current: number
  deadline: string
  color: string
}

interface ToastState {
  msg: string
  type: 'success' | 'error'
}

interface MonthlyTrend {
  label: string
  exp: number
  inc: number
}

interface ReportData {
  exps: Expense[]
  incs: Income[]
  totalE: number
  totalI: number
  byCategory: { cat: string; amount: number }[]
  byIncCat: { cat: string; amount: number }[]
}

// Form state types
interface ExpenseForm {
  description: string
  amount: string
  category: string
  date: string
  tags: string
  note: string
}

interface IncomeForm {
  source: string
  amount: string
  category: string
  date: string
  note: string
}

interface BudgetForm {
  category: string
  amount: string
  period: string
}

interface RecurringForm {
  description: string
  amount: string
  category: string
  frequency: string
  nextDate: string
  type: 'expense' | 'income'
  active: boolean
}

interface NoteForm {
  title: string
  body: string
  date: string
}

interface GoalForm {
  name: string
  target: string
  current: string
  deadline: string
  color: string
}

// Component prop types
interface DotProps {
  color: string
  size?: number
}

interface TagProps {
  label: string
}

interface BarProps {
  pct: number
  color?: string
  h?: number
}

interface KPIProps {
  label: string
  value: string | number
  sub?: string
  color?: string
  delta?: number
}

interface BtnProps {
  children: React.ReactNode
  onClick: () => void
  variant?: 'primary' | 'danger' | 'ghost' | 'green' | 'amber'
  small?: boolean
  style?: React.CSSProperties
  [key: string]: any
}

interface Input2Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

interface Sel2Props extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  children: React.ReactNode
}

interface ModalProps {
  title: string
  onClose: () => void
  children: React.ReactNode
  wide?: boolean
}

interface EmptyProps {
  msg: string
}

interface ToastProps {
  msg: string
  type: 'success' | 'error'
}

interface Tab {
  id: string
  label: string
}

// ========== CONSTANTS ==========
const EXP_CATS = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Healthcare', 'Education', 'Housing', 'Travel', 'Fitness', 'Other'] as const
const INC_CATS = ['Salary', 'Freelance', 'Investment', 'Rental', 'Business', 'Gift', 'Other'] as const
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const

type ExpenseCategory = typeof EXP_CATS[number]
type IncomeCategory = typeof INC_CATS[number]

const CAT_COLOR: Record<string, string> = {
  Food: '#e85d04', Transport: '#0077b6', Entertainment: '#7b2d8b', Shopping: '#c9184a',
  Bills: '#495057', Healthcare: '#2d6a4f', Education: '#e9c46a', Housing: '#457b9d',
  Travel: '#f4a261', Fitness: '#52b788', Other: '#6c757d',
  Salary: '#2d6a4f', Freelance: '#0077b6', Investment: '#7b2d8b', Rental: '#e9c46a',
  Business: '#e85d04', Gift: '#c9184a',
}

// ========== UTILITY FUNCTIONS ==========
const fmt = (n: number): string => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n || 0)
const fmtShort = (n: number): string => n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : fmt(n)
const todayStr = (): string => new Date().toISOString().split('T')[0]
const monthOf = (d?: string): string => d?.slice(0, 7) || ''
const currentMonth = (): string => new Date().toISOString().slice(0, 7)
const uid = (): string => Date.now() + Math.random().toString(36).slice(2)

const storage = {
  get: <T,>(k: string, fb: T): T => {
    try {
      const item = localStorage.getItem(k)
      return item ? JSON.parse(item) : fb
    } catch {
      return fb
    }
  },
  set: (k: string, v: any): void => {
    try {
      localStorage.setItem(k, JSON.stringify(v))
    } catch { }
  }
}

// ========== COMPONENTS ==========
const Dot = ({ color, size = 8 }: DotProps) => (
  <span style={{ display: 'inline-block', width: size, height: size, borderRadius: '50%', background: color, flexShrink: 0 }} />
)

const Tag = ({ label }: TagProps) => (
  <span style={{
    background: CAT_COLOR[label] + '22', color: CAT_COLOR[label], border: `1px solid ${CAT_COLOR[label]}44`,
    padding: '2px 10px', borderRadius: 4, fontSize: 11, fontWeight: 700, letterSpacing: .5, textTransform: 'uppercase'
  }}>
    {label}
  </span>
)

const Bar = ({ pct, color = '#0077b6', h = 6 }: BarProps) => (
  <div style={{ background: '#e9ecef', borderRadius: h, height: h, overflow: 'hidden', width: '100%' }}>
    <div style={{
      width: `${Math.min(pct || 0, 100)}%`, height: '100%', borderRadius: h,
      background: pct > 100 ? '#e63946' : pct > 80 ? '#f4a261' : color, transition: 'width .4s ease'
    }} />
  </div>
)

const KPI = ({ label, value, sub, color = '#212529', delta }: KPIProps) => (
  <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '20px 24px', position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', background: color, borderRadius: '8px 0 0 8px' }} />
    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--muted)', margin: '0 0 8px' }}>{label}</p>
    <p style={{ fontSize: 26, fontWeight: 900, color, margin: 0, lineHeight: 1 }}>{value}</p>
    {sub && <p style={{ fontSize: 12, color: 'var(--muted)', margin: '6px 0 0' }}>{sub}</p>}
    {delta !== undefined && (
      <span style={{
        position: 'absolute', top: 16, right: 16, fontSize: 11, fontWeight: 700,
        color: delta >= 0 ? '#2d6a4f' : '#e63946', background: delta >= 0 ? '#d8f3dc' : '#ffe5e5', padding: '2px 8px', borderRadius: 4
      }}>
        {delta >= 0 ? '+' : ''}{delta.toFixed(1)}%
      </span>
    )}
  </div>
)

const Btn = ({ children, onClick, variant = 'primary', small, style: s = {}, ...rest }: BtnProps) => {
  const variants = {
    primary: { background: 'var(--accent)', color: '#fff' },
    danger: { background: '#e63946', color: '#fff' },
    ghost: { background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)' },
    green: { background: '#2d6a4f', color: '#fff' },
    amber: { background: '#e9c46a', color: '#212529' },
  }
  return (
    <button onClick={onClick}
      style={{
        border: 'none', borderRadius: 6, fontWeight: 700, cursor: 'pointer', fontSize: small ? 11 : 13,
        letterSpacing: .3, transition: 'all .15s', display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: small ? '4px 10px' : '9px 18px', ...variants[variant], ...s
      }}
      {...rest}>
      {children}
    </button>
  )
}

const Input2 = ({ label, ...props }: Input2Props) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
    {label && <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: .8, textTransform: 'uppercase', color: 'var(--muted)' }}>{label}</label>}
    <input style={{
      border: '1px solid var(--border)', borderRadius: 6, padding: '9px 12px', fontSize: 14,
      outline: 'none', background: 'var(--input-bg)', color: 'var(--text)', width: '100%', boxSizing: 'border-box', fontFamily: 'inherit'
    }}
      {...props} />
  </div>
)

const Sel2 = ({ label, children, ...props }: Sel2Props) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
    {label && <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: .8, textTransform: 'uppercase', color: 'var(--muted)' }}>{label}</label>}
    <select style={{
      border: '1px solid var(--border)', borderRadius: 6, padding: '9px 12px', fontSize: 14,
      outline: 'none', background: 'var(--input-bg)', color: 'var(--text)', width: '100%', fontFamily: 'inherit', appearance: 'none'
    }}
      {...props}>{children}</select>
  </div>
)

const Modal = ({ title, onClose, children, wide }: ModalProps) => (
  <div style={{
    position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)', padding: 16
  }} onClick={onClose}>
    <div style={{
      background: 'var(--surface)', borderRadius: 10, padding: 32, width: '100%', maxWidth: wide ? 680 : 440,
      maxHeight: '90vh', overflowY: 'auto', position: 'relative', boxShadow: '0 24px 64px rgba(0,0,0,.3)'
    }}
      onClick={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, letterSpacing: -.3, color: 'var(--text)' }}>{title}</h3>
        <button onClick={onClose} style={{
          border: '1px solid var(--border)', background: 'var(--input-bg)', borderRadius: 6,
          width: 32, height: 32, cursor: 'pointer', fontSize: 18, color: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1
        }}>
          ×
        </button>
      </div>
      {children}
    </div>
  </div>
)

const Empty = ({ msg }: EmptyProps) => (
  <div style={{ textAlign: 'center', padding: '56px 24px', color: 'var(--muted)' }}>
    <div style={{ width: 48, height: 2, background: 'var(--border)', margin: '0 auto 16px' }} />
    <p style={{ margin: 0, fontSize: 13, letterSpacing: .3 }}>{msg}</p>
  </div>
)

const Toast = ({ msg, type }: ToastProps) => (
  <div style={{
    position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
    background: type === 'error' ? '#e63946' : 'var(--accent)', color: '#fff', padding: '12px 20px',
    borderRadius: 8, fontSize: 14, fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,.3)', animation: 'slideUp .2s ease'
  }}>
    {msg}
  </div>
)

// ========== MAIN APP COMPONENT ==========
export default function App() {
  const [tab, setTab] = useState<string>('dashboard')
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [income, setIncome] = useState<Income[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [recurring, setRecurring] = useState<Recurring[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [dark, setDark] = useState<boolean>(false)
  const [toast, setToast] = useState<ToastState | null>(null)

  const [expModal, setExpModal] = useState<boolean>(false)
  const [incModal, setIncModal] = useState<boolean>(false)
  const [budModal, setBudModal] = useState<boolean>(false)
  const [recurModal, setRecurModal] = useState<boolean>(false)
  const [noteModal, setNoteModal] = useState<boolean>(false)
  const [goalModal, setGoalModal] = useState<boolean>(false)
  const [bulkModal, setBulkModal] = useState<boolean>(false)

  const blankExp = (): ExpenseForm => ({ description: '', amount: '', category: 'Food', date: todayStr(), tags: '', note: '' })
  const blankInc = (): IncomeForm => ({ source: '', amount: '', category: 'Salary', date: todayStr(), note: '' })
  const blankBud = (): BudgetForm => ({ category: 'Food', amount: '', period: 'monthly' })
  const blankRecur = (): RecurringForm => ({ description: '', amount: '', category: 'Bills', frequency: 'monthly', nextDate: todayStr(), type: 'expense', active: true })
  const blankNote = (): NoteForm => ({ title: '', body: '', date: todayStr() })
  const blankGoal = (): GoalForm => ({ name: '', target: '', current: '0', deadline: '', color: '#0077b6' })

  const [expForm, setExpForm] = useState<ExpenseForm>(blankExp())
  const [incForm, setIncForm] = useState<IncomeForm>(blankInc())
  const [budForm, setBudForm] = useState<BudgetForm>(blankBud())
  const [recurForm, setRecurForm] = useState<RecurringForm>(blankRecur())
  const [noteForm, setNoteForm] = useState<NoteForm>(blankNote())
  const [goalForm, setGoalForm] = useState<GoalForm>(blankGoal())
  const [bulkText, setBulkText] = useState<string>('')

  const [editExp, setEditExp] = useState<Expense | null>(null)
  const [editInc, setEditInc] = useState<Income | null>(null)
  const [editNote, setEditNote] = useState<Note | null>(null)
  const [editGoal, setEditGoal] = useState<Goal | null>(null)

  const [search, setSearch] = useState<string>('')
  const [filterCat, setFilterCat] = useState<string>('all')
  const [dateStart, setDateStart] = useState<string>('')
  const [dateEnd, setDateEnd] = useState<string>('')
  const [minAmt, setMinAmt] = useState<string>('')
  const [maxAmt, setMaxAmt] = useState<string>('')
  const [sortBy, setSortBy] = useState<string>('date')
  const [sortDir, setSortDir] = useState<string>('desc')
  const [incSearch, setIncSearch] = useState<string>('')
  const [incFilterCat, setIncFilterCat] = useState<string>('all')
  const [reportMonth, setReportMonth] = useState<string>(currentMonth())

  useEffect(() => {
    setExpenses(storage.get('ft2_expenses', []))
    setIncome(storage.get('ft2_income', []))
    setBudgets(storage.get('ft2_budgets', []))
    setRecurring(storage.get('ft2_recurring', []))
    setNotes(storage.get('ft2_notes', []))
    setGoals(storage.get('ft2_goals', []))
  }, [])

  const save = useCallback(<T,>(key: string, data: T, setter: React.Dispatch<React.SetStateAction<T>>): void => {
    storage.set(key, data)
    setter(data)
  }, [])

  const notify = (msg: string, type: 'success' | 'error' = 'success'): void => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2600)
  }

  // EXPENSE OPS
  const openAddExp = (): void => { setEditExp(null); setExpForm(blankExp()); setExpModal(true) }
  const openEditExp = (e: Expense): void => { setEditExp(e); setExpForm({ ...e, amount: String(e.amount), tags: e.tags || '', note: e.note || '' }); setExpModal(true) }
  const submitExp = (): void => {
    const amt = parseFloat(expForm.amount)
    if (!expForm.description.trim() || !amt || amt <= 0) { notify('Fill all required fields', 'error'); return }
    const updated = editExp
      ? expenses.map(x => x.id === editExp.id ? { ...x, ...expForm, amount: amt } : x)
      : [...expenses, { id: uid(), ...expForm, amount: amt }]
    save('ft2_expenses', updated, setExpenses); setExpModal(false); notify(editExp ? 'Expense updated' : 'Expense added')
  }
  const deleteExp = (id: string): void => { save('ft2_expenses', expenses.filter(x => x.id !== id), setExpenses); notify('Deleted') }
  const dupExp = (e: Expense): void => { save('ft2_expenses', [...expenses, { ...e, id: uid(), date: todayStr() }], setExpenses); notify('Duplicated') }

  // INCOME OPS
  const openAddInc = (): void => { setEditInc(null); setIncForm(blankInc()); setIncModal(true) }
  const openEditInc = (i: Income): void => { setEditInc(i); setIncForm({ ...i, amount: String(i.amount), note: i.note || '' }); setIncModal(true) }
  const submitInc = (): void => {
    const amt = parseFloat(incForm.amount)
    if (!incForm.source.trim() || !amt || amt <= 0) { notify('Fill all required fields', 'error'); return }
    const updated = editInc
      ? income.map(x => x.id === editInc.id ? { ...x, ...incForm, amount: amt } : x)
      : [...income, { id: uid(), ...incForm, amount: amt }]
    save('ft2_income', updated, setIncome); setIncModal(false); notify(editInc ? 'Income updated' : 'Income added')
  }
  const deleteInc = (id: string): void => { save('ft2_income', income.filter(x => x.id !== id), setIncome); notify('Deleted') }

  // BUDGET OPS
  const submitBud = (): void => {
    const amt = parseFloat(budForm.amount)
    if (!budForm.category || !amt || amt <= 0) { notify('Fill all fields', 'error'); return }
    const exists = budgets.find(b => b.category === budForm.category)
    const updated = exists
      ? budgets.map(b => b.category === budForm.category ? { ...b, amount: amt, period: budForm.period } : b)
      : [...budgets, { id: uid(), ...budForm, amount: amt }]
    save('ft2_budgets', updated, setBudgets); setBudModal(false); notify('Budget saved')
  }
  const deleteBud = (id: string): void => { save('ft2_budgets', budgets.filter(b => b.id !== id), setBudgets) }

  // RECURRING OPS
  const submitRecur = (): void => {
    const amt = parseFloat(recurForm.amount)
    if (!recurForm.description.trim() || !amt || amt <= 0) { notify('Fill all fields', 'error'); return }
    save('ft2_recurring', [...recurring, { id: uid(), ...recurForm, amount: amt, active: true }], setRecurring)
    setRecurModal(false); notify('Recurring rule added')
  }
  const deleteRecur = (id: string): void => { save('ft2_recurring', recurring.filter(r => r.id !== id), setRecurring) }
  const toggleRecur = (id: string): void => { save('ft2_recurring', recurring.map(r => r.id === id ? { ...r, active: !r.active } : r), setRecurring) }
  const applyRecur = (r: Recurring): void => {
    const entry = { id: uid(), description: r.description, amount: r.amount, category: r.category, date: todayStr(), tags: 'recurring', note: 'From recurring rule' }
    if (r.type === 'expense') save('ft2_expenses', [...expenses, entry], setExpenses)
    else save('ft2_income', [...income, { ...entry, source: r.description }], setIncome)
    notify('Applied')
  }

  // NOTES OPS
  const submitNote = (): void => {
    if (!noteForm.title.trim()) { notify('Title required', 'error'); return }
    const updated = editNote
      ? notes.map(n => n.id === editNote.id ? { ...n, ...noteForm } : n)
      : [...notes, { id: uid(), ...noteForm }]
    save('ft2_notes', updated, setNotes); setNoteModal(false); notify('Note saved')
  }
  const deleteNote = (id: string): void => { save('ft2_notes', notes.filter(n => n.id !== id), setNotes) }

  // GOALS OPS
  const submitGoal = (): void => {
    if (!goalForm.name.trim() || !goalForm.target) { notify('Fill required fields', 'error'); return }
    const updated = editGoal
      ? goals.map(g => g.id === editGoal.id ? { ...g, ...goalForm, target: parseFloat(goalForm.target), current: parseFloat(goalForm.current || '0') } : g)
      : [...goals, { id: uid(), ...goalForm, target: parseFloat(goalForm.target), current: parseFloat(goalForm.current || '0') }]
    save('ft2_goals', updated, setGoals); setGoalModal(false); notify('Goal saved')
  }
  const deleteGoal = (id: string): void => { save('ft2_goals', goals.filter(g => g.id !== id), setGoals) }

  // BULK IMPORT
  const processBulk = (): void => {
    const lines = bulkText.trim().split('\n').filter(l => l.trim())
    const added: Expense[] = []
    const skipped: number[] = []
    lines.forEach((line, i) => {
      const [desc, amtStr, cat, dateStr] = line.split(',').map(p => p.trim())
      const amt = parseFloat(amtStr)
      if (!desc || isNaN(amt) || amt <= 0) { skipped.push(i + 1); return }
      added.push({
        id: uid(), description: desc, amount: amt,
        category: EXP_CATS.includes(cat as ExpenseCategory) ? cat : 'Other',
        date: dateStr || todayStr(), tags: 'bulk-import', note: ''
      })
    })
    if (added.length) save('ft2_expenses', [...expenses, ...added], setExpenses)
    setBulkModal(false); setBulkText('')
    notify(`Imported ${added.length}${skipped.length ? `, skipped ${skipped.length}` : ''}`)
  }

  // EXPORT
  const exportJSON = (): void => {
    const blob = new Blob([JSON.stringify({ expenses, income, budgets, recurring, notes, goals }, null, 2)], { type: 'application/json' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `fintrack-${todayStr()}.json`; a.click()
    notify('JSON exported')
  }
  const exportCSV = (): void => {
    const hdr = 'Type,Description,Amount,Category,Date,Tags,Note'
    const rows = [
      ...expenses.map(e => `Expense,"${e.description}",${e.amount},${e.category},${e.date},"${e.tags || ''}","${e.note || ''}"`),
      ...income.map(i => `Income,"${i.source}",${i.amount},${i.category},${i.date},"","${i.note || ''}"`),
    ]
    const blob = new Blob([[hdr, ...rows].join('\n')], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `fintrack-${todayStr()}.csv`; a.click()
    notify('CSV exported')
  }
  const importJSON = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0]
    if (!file) return
    const r = new FileReader()
    r.onload = (ev: ProgressEvent<FileReader>) => {
      try {
        const d = JSON.parse(ev.target?.result as string)
        if (d.expenses) save('ft2_expenses', d.expenses, setExpenses)
        if (d.income) save('ft2_income', d.income, setIncome)
        if (d.budgets) save('ft2_budgets', d.budgets, setBudgets)
        if (d.recurring) save('ft2_recurring', d.recurring, setRecurring)
        if (d.notes) save('ft2_notes', d.notes, setNotes)
        if (d.goals) save('ft2_goals', d.goals, setGoals)
        notify('Import successful')
      } catch {
        notify('Invalid file', 'error')
      }
    }
    r.readAsText(file); e.target.value = ''
  }

  // COMPUTED
  const totalExp = useMemo(() => expenses.reduce((s, x) => s + x.amount, 0), [expenses])
  const totalInc = useMemo(() => income.reduce((s, x) => s + x.amount, 0), [income])
  const balance = totalInc - totalExp
  const thisMonthExp = useMemo(() => expenses.filter(x => monthOf(x.date) === currentMonth()).reduce((s, x) => s + x.amount, 0), [expenses])
  const thisMonthInc = useMemo(() => income.filter(x => monthOf(x.date) === currentMonth()).reduce((s, x) => s + x.amount, 0), [income])
  const lastMonthExp = useMemo(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 1)
    return expenses.filter(x => monthOf(x.date) === d.toISOString().slice(0, 7)).reduce((s, x) => s + x.amount, 0)
  }, [expenses])
  const monthDelta = lastMonthExp ? ((thisMonthExp - lastMonthExp) / lastMonthExp) * 100 : 0
  const totalBud = useMemo(() => budgets.reduce((s, b) => s + b.amount, 0), [budgets])
  const budPct = totalBud > 0 ? (thisMonthExp / totalBud) * 100 : 0
  const catSpend = useCallback((cat: string, month: string | null = null): number =>
    expenses.filter(x => x.category === cat && (!month || monthOf(x.date) === month)).reduce((s, x) => s + x.amount, 0), [expenses])

  const monthlyTrend = useMemo((): MonthlyTrend[] => {
    const out: MonthlyTrend[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i)
      const m = d.toISOString().slice(0, 7)
      out.push({
        label: MONTHS[d.getMonth()],
        exp: expenses.filter(x => monthOf(x.date) === m).reduce((s, x) => s + x.amount, 0),
        inc: income.filter(x => monthOf(x.date) === m).reduce((s, x) => s + x.amount, 0)
      })
    }
    return out
  }, [expenses, income])

  const filteredExp = useMemo(() => {
    let list = [...expenses]
    if (search) list = list.filter(x => [x.description, x.category, x.tags || ''].join(' ').toLowerCase().includes(search.toLowerCase()))
    if (filterCat !== 'all') list = list.filter(x => x.category === filterCat)
    if (dateStart) list = list.filter(x => x.date >= dateStart)
    if (dateEnd) list = list.filter(x => x.date <= dateEnd)
    if (minAmt) list = list.filter(x => x.amount >= parseFloat(minAmt))
    if (maxAmt) list = list.filter(x => x.amount <= parseFloat(maxAmt))
    list.sort((a, b) => {
      const v = sortBy === 'amount' ? a.amount - b.amount : a.date.localeCompare(b.date)
      return sortDir === 'asc' ? v : -v
    })
    return list
  }, [expenses, search, filterCat, dateStart, dateEnd, minAmt, maxAmt, sortBy, sortDir])

  const filteredInc = useMemo(() => {
    let list = [...income]
    if (incSearch) list = list.filter(x => [x.source, x.category].join(' ').toLowerCase().includes(incSearch.toLowerCase()))
    if (incFilterCat !== 'all') list = list.filter(x => x.category === incFilterCat)
    return list.sort((a, b) => b.date.localeCompare(a.date))
  }, [income, incSearch, incFilterCat])

  const reportData = useMemo((): ReportData => {
    const exps = expenses.filter(x => monthOf(x.date) === reportMonth)
    const incs = income.filter(x => monthOf(x.date) === reportMonth)
    const totalE = exps.reduce((s, x) => s + x.amount, 0)
    const totalI = incs.reduce((s, x) => s + x.amount, 0)
    const byCategory = EXP_CATS.map(cat => ({ cat, amount: exps.filter(x => x.category === cat).reduce((s, x) => s + x.amount, 0) })).filter(x => x.amount > 0).sort((a, b) => b.amount - a.amount)
    const byIncCat = INC_CATS.map(cat => ({ cat, amount: incs.filter(x => x.category === cat).reduce((s, x) => s + x.amount, 0) })).filter(x => x.amount > 0).sort((a, b) => b.amount - a.amount)
    return { exps, incs, totalE, totalI, byCategory, byIncCat }
  }, [expenses, income, reportMonth])

  const topDay = useMemo((): [string, number] | null => {
    const map: Record<string, number> = {}
    expenses.forEach(x => { map[x.date] = (map[x.date] || 0) + x.amount })
    const entries = Object.entries(map).sort((a, b) => b[1] - a[1])
    return entries[0] as [string, number] || null
  }, [expenses])

  const TABS: Tab[] = [
    { id: 'dashboard', label: 'Overview' },
    { id: 'expenses', label: 'Expenses' },
    { id: 'income', label: 'Income' },
    { id: 'budgets', label: 'Budgets' },
    { id: 'goals', label: 'Goals' },
    { id: 'recurring', label: 'Recurring' },
    { id: 'reports', label: 'Reports' },
    { id: 'notes', label: 'Notes' },
  ]

  const hasFilters = search || filterCat !== 'all' || dateStart || dateEnd || minAmt || maxAmt

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: "'Syne','Segoe UI',sans-serif", color: 'var(--text)' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap');
        *, *::before, *::after {box-sizing:border-box;margin:0;padding:0}
        :root {
          --bg:${dark ? '#0d1117' : '#f2f4f7'};
          --surface:${dark ? '#161b22' : '#ffffff'};
          --border:${dark ? '#30363d' : '#e1e4e8'};
          --text:${dark ? '#e6edf3' : '#1a1d21'};
          --muted:${dark ? '#8b949e' : '#6c757d'};
          --accent:${dark ? '#e6edf3' : '#1a1d21'};
          --input-bg:${dark ? '#0d1117' : '#f8f9fa'};
        }
        input,select,textarea{font-family:inherit;color:var(--text)}
        button{font-family:inherit}
        .tr-hover:hover{background:${dark ? '#1c2129' : '#f6f8fa'} !important}
        .tab-btn{border:none;background:transparent;cursor:pointer;padding:11px 16px;font-weight:700;font-size:13px;letter-spacing:.2px;white-space:nowrap;transition:all .15s;border-bottom:2px solid transparent;color:var(--muted)}
        .tab-btn.active{border-bottom-color:var(--text);color:var(--text)}
        .tab-btn:hover:not(.active){color:var(--text)}
        @keyframes slideUp{from{transform:translateY(8px);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        .fade-in{animation:fadeIn .18s ease}
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:var(--border);border-radius:3px}
        input[type=date]{color-scheme:${dark ? 'dark' : 'light'}}
        input:focus,select:focus,textarea:focus{border-color:#0077b6 !important;box-shadow:0 0 0 3px #0077b620}
      `}</style>

      {/* HEADER */}
      <header style={{ background: dark ? '#0d1117' : '#1a1d21', color: '#fff', padding: '0 24px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 52 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <rect width="22" height="22" rx="5" fill="white" />
              <rect x="5" y="13" width="4" height="5" rx="1" fill="#1a1d21" />
              <rect x="9" y="9" width="4" height="9" rx="1" fill="#1a1d21" />
              <rect x="13" y="6" width="4" height="12" rx="1" fill="#1a1d21" />
            </svg>
            <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: -.4 }}>FinTrack</span>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,.35)', letterSpacing: 2, textTransform: 'uppercase', marginLeft: 2, fontWeight: 700 }}>PRO</span>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {[
              { label: dark ? 'Light Mode' : 'Dark Mode', action: () => setDark(!dark) },
              { label: 'Export CSV', action: exportCSV },
              { label: 'Export JSON', action: exportJSON },
            ].map(b => (
              <button key={b.label} onClick={b.action} style={{
                border: '1px solid rgba(255,255,255,.18)',
                background: 'rgba(255,255,255,.07)', color: 'rgba(255,255,255,.85)',
                padding: '5px 13px', borderRadius: 5, cursor: 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: .3
              }}>
                {b.label}
              </button>
            ))}
            <label style={{
              border: '1px solid rgba(255,255,255,.18)', background: 'rgba(255,255,255,.07)',
              color: 'rgba(255,255,255,.85)', padding: '5px 13px', borderRadius: 5, cursor: 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: .3
            }}>
              Import JSON <input type="file" accept=".json" style={{ display: 'none' }} onChange={importJSON} />
            </label>
          </div>
        </div>
      </header>

      {/* NAV */}
      <nav style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 52, zIndex: 99, overflowX: 'auto' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`tab-btn${tab === t.id ? ' active' : ''}`}>{t.label}</button>
          ))}
        </div>
      </nav>

      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 24px' }} className="fade-in">

        {/* DASHBOARD */}
        {tab === 'dashboard' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14, marginBottom: 22 }}>
              <KPI label="This Month — Expenses" value={fmtShort(thisMonthExp)} color="#e63946" delta={monthDelta}
                sub={`${expenses.filter(x => monthOf(x.date) === currentMonth()).length} transactions`} />
              <KPI label="This Month — Income" value={fmtShort(thisMonthInc)} color="#2d6a4f"
                sub={`${income.filter(x => monthOf(x.date) === currentMonth()).length} entries`} />
              <KPI label="All-Time Balance" value={fmtShort(Math.abs(balance))} color={balance >= 0 ? '#0077b6' : '#e63946'}
                sub={balance >= 0 ? 'Surplus' : 'Deficit'} />
              <KPI label="Monthly Budget Used" value={`${budPct.toFixed(0)}%`}
                color={budPct > 100 ? '#e63946' : budPct > 80 ? '#f4a261' : '#2d6a4f'}
                sub={totalBud > 0 ? `${fmt(thisMonthExp)} of ${fmt(totalBud)}` : 'No budgets set'} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 18, marginBottom: 18 }}>
              {/* Bar chart trend */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 24 }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 20 }}>6-Month Overview</p>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 110 }}>
                  {monthlyTrend.map((m, i) => {
                    const mx = Math.max(...monthlyTrend.map(x => Math.max(x.exp, x.inc)), 1)
                    return (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <div style={{ width: '100%', display: 'flex', gap: 2, alignItems: 'flex-end', height: 88 }}>
                          <div style={{ flex: 1, background: '#e6394655', borderRadius: '3px 3px 0 0', height: `${(m.exp / mx) * 100}%`, minHeight: 3 }} />
                          <div style={{ flex: 1, background: '#2d6a4f55', borderRadius: '3px 3px 0 0', height: `${(m.inc / mx) * 100}%`, minHeight: 3 }} />
                        </div>
                        <span style={{ fontSize: 9, color: 'var(--muted)', fontWeight: 700, letterSpacing: .5 }}>{m.label}</span>
                      </div>
                    )
                  })}
                </div>
                <div style={{ display: 'flex', gap: 20, marginTop: 14 }}>
                  <span style={{ fontSize: 11, color: '#e63946', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}><Dot color="#e63946" size={7} /> Expense</span>
                  <span style={{ fontSize: 11, color: '#2d6a4f', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}><Dot color="#2d6a4f" size={7} /> Income</span>
                </div>
              </div>

              {/* Category breakdown */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 24 }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 18 }}>Top Categories (This Month)</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                  {EXP_CATS.map(cat => {
                    const amt = catSpend(cat, currentMonth())
                    if (!amt) return null
                    const pct = thisMonthExp > 0 ? (amt / thisMonthExp) * 100 : 0
                    return (
                      <div key={cat}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Dot color={CAT_COLOR[cat]} />{cat}
                          </span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{fmt(amt)}</span>
                        </div>
                        <Bar pct={pct} color={CAT_COLOR[cat]} h={5} />
                      </div>
                    )
                  }).filter(Boolean).slice(0, 5)}
                  {thisMonthExp === 0 && <p style={{ fontSize: 13, color: 'var(--muted)' }}>No expenses recorded this month.</p>}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 18, marginBottom: 18 }}>
              {/* Recent transactions */}
              {/* Recent transactions */}
<div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 24 }}>
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--muted)' }}>Recent Transactions</p>
    <button onClick={() => setTab('expenses')} style={{ fontSize: 12, color: '#0077b6', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>All expenses →</button>
  </div>
  {(() => {
    const recentExpenses = expenses.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5).map(e => ({ ...e, _t: 'exp' as const }))
    const recentIncome = income.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4).map(i => ({ ...i, _t: 'inc' as const }))
    const allItems = [...recentExpenses, ...recentIncome].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 9)
    
    return allItems.map(item => (
      <div key={item.id} className="tr-hover" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Dot color={item._t === 'exp' ? '#e63946' : '#2d6a4f'} size={7} />
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
              {item._t === 'exp' ? (item as any).description : (item as any).source}
            </p>
            <p style={{ fontSize: 11, color: 'var(--muted)' }}>{item.date} · {item.category}</p>
          </div>
        </div>
        <span style={{ fontWeight: 800, fontSize: 13, color: item._t === 'exp' ? '#e63946' : '#2d6a4f' }}>
          {item._t === 'exp' ? '-' : '+'}{fmt(item.amount)}
        </span>
      </div>
    ))
  })()}
  {expenses.length + income.length === 0 && <Empty msg="No transactions yet." />}
</div>
              {/* Budget overview */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--muted)' }}>Budget Status</p>
                  <button onClick={() => setTab('budgets')} style={{ fontSize: 12, color: '#0077b6', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Manage →</button>
                </div>
                {budgets.length > 0 ? budgets.map(b => {
                  const spent = catSpend(b.category, currentMonth())
                  const pct = b.amount > 0 ? (spent / b.amount) * 100 : 0
                  return (
                    <div key={b.id} style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Dot color={CAT_COLOR[b.category]} />{b.category}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--muted)' }}>{fmt(spent)}/{fmt(b.amount)}</span>
                      </div>
                      <Bar pct={pct} color={CAT_COLOR[b.category]} />
                    </div>
                  )
                }) : <Empty msg="No budgets set." />}
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 12 }}>
              {[
                { label: 'Total Income (All)', value: fmt(totalInc), color: '#2d6a4f' },
                { label: 'Total Expenses (All)', value: fmt(totalExp), color: '#e63946' },
                { label: 'Savings Rate', value: totalInc > 0 ? `${Math.max(0, ((totalInc - totalExp) / totalInc) * 100).toFixed(1)}%` : '—', color: '#0077b6' },
                { label: 'Highest Day', value: topDay ? topDay[0] : '—', color: '#7b2d8b', sub: topDay ? fmt(topDay[1]) : undefined },
                { label: 'Total Transactions', value: expenses.length + income.length, color: '#e85d04' },
                { label: 'Active Budgets', value: budgets.length, color: '#2d6a4f' },
              ].map(s => (
                <div key={s.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '14px 18px' }}>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: .8, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>{s.label}</p>
                  <p style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{s.value}</p>
                  {s.sub && <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{s.sub}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EXPENSES */}
        {tab === 'expenses' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 900, letterSpacing: -.5, color: 'var(--text)' }}>Expenses</h2>
                <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 3 }}>
                  {filteredExp.length} of {expenses.length} records &nbsp;·&nbsp; {fmt(filteredExp.reduce((s, x) => s + x.amount, 0))} shown
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Btn variant="ghost" onClick={() => setBulkModal(true)}>Bulk CSV Import</Btn>
                <Btn onClick={openAddExp}>+ Add Expense</Btn>
              </div>
            </div>

            {/* Filter panel */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 18, marginBottom: 18 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
                <Input2 placeholder="Search description, category, tags..." value={search} onChange={e => setSearch(e.target.value)} />
                <Sel2 value={filterCat} onChange={e => setFilterCat(e.target.value)}>
                  <option value="all">All Categories</option>
                  {EXP_CATS.map(c => <option key={c}>{c}</option>)}
                </Sel2>
                <Input2 type="date" value={dateStart} onChange={e => setDateStart(e.target.value)} />
                <Input2 type="date" value={dateEnd} onChange={e => setDateEnd(e.target.value)} />
                <Input2 type="number" placeholder="Min $" value={minAmt} onChange={e => setMinAmt(e.target.value)} />
                <Input2 type="number" placeholder="Max $" value={maxAmt} onChange={e => setMaxAmt(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginRight: 4 }}>Sort by</span>
                {[{ v: 'date', l: 'Date' }, { v: 'amount', l: 'Amount' }].map(s => (
                  <button key={s.v} onClick={() => setSortBy(s.v)}
                    style={{
                      padding: '4px 12px', borderRadius: 4, border: `1px solid ${sortBy === s.v ? 'var(--text)' : 'var(--border)'}`,
                      background: sortBy === s.v ? 'var(--accent)' : 'transparent',
                      color: sortBy === s.v ? 'var(--surface)' : 'var(--muted)', fontSize: 11, fontWeight: 700, cursor: 'pointer'
                    }}>
                    {s.l}
                  </button>
                ))}
                <span style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginLeft: 8 }}>Direction</span>
                {[{ v: 'desc', l: 'Newest/Highest' }, { v: 'asc', l: 'Oldest/Lowest' }].map(s => (
                  <button key={s.v} onClick={() => setSortDir(s.v)}
                    style={{
                      padding: '4px 12px', borderRadius: 4, border: `1px solid ${sortDir === s.v ? 'var(--text)' : 'var(--border)'}`,
                      background: sortDir === s.v ? 'var(--accent)' : 'transparent',
                      color: sortDir === s.v ? 'var(--surface)' : 'var(--muted)', fontSize: 11, fontWeight: 700, cursor: 'pointer'
                    }}>
                    {s.l}
                  </button>
                ))}
                {hasFilters && (
                  <button onClick={() => { setSearch(''); setFilterCat('all'); setDateStart(''); setDateEnd(''); setMinAmt(''); setMaxAmt('') }}
                    style={{ padding: '4px 12px', borderRadius: 4, border: '1px solid #e63946', background: 'transparent',
                      color: '#e63946', fontSize: 11, fontWeight: 700, cursor: 'pointer', marginLeft: 8 }}>
                    Clear All Filters
                  </button>
                )}
              </div>
            </div>

            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
              {filteredExp.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: dark ? '#1c2129' : '#f6f8fa' }}>
                      <tr>
                        {['Description', 'Category', 'Date', 'Tags', 'Amount', ''].map(h => (
                          <th key={h} style={{
                            fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
                            color: 'var(--muted)', padding: '10px 16px', textAlign: 'left',
                            borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap'
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExp.map(exp => (
                        <tr key={exp.id} className="tr-hover" style={{ background: 'var(--surface)' }}>
                          <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 14, verticalAlign: 'middle' }}>
                            <span style={{ fontWeight: 600, color: 'var(--text)', display: 'block' }}>{exp.description}</span>
                            {exp.note && <span style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginTop: 2 }}>{exp.note}</span>}
                          </td>
                          <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle' }}>
                            <Tag label={exp.category} />
                          </td>
                          <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 12, color: 'var(--muted)', verticalAlign: 'middle' }}>{exp.date}</td>
                          <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle' }}>
                            {(exp.tags || '').split(',').map(t => t.trim()).filter(Boolean).map(t => (
                              <span key={t} style={{
                                display: 'inline-block', background: 'var(--border)', color: 'var(--muted)',
                                padding: '1px 7px', borderRadius: 3, fontSize: 10, marginRight: 3, fontWeight: 600, letterSpacing: .3
                              }}>{t}</span>
                            ))}
                          </td>
                          <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', textAlign: 'right', fontWeight: 800, color: '#e63946', fontSize: 15, verticalAlign: 'middle' }}>
                            -{fmt(exp.amount)}
                          </td>
                          <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', textAlign: 'right', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                            <button onClick={() => dupExp(exp)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 11, fontWeight: 700, padding: '4px 6px' }}>Copy</button>
                            <button onClick={() => openEditExp(exp)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#0077b6', fontSize: 11, fontWeight: 700, padding: '4px 6px' }}>Edit</button>
                            <button onClick={() => deleteExp(exp.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#e63946', fontSize: 11, fontWeight: 700, padding: '4px 6px' }}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot style={{ background: dark ? '#1c2129' : '#f6f8fa' }}>
                      <tr>
                        <td colSpan={4} style={{ padding: '10px 16px', fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--muted)', borderTop: '1px solid var(--border)' }}>
                          Total ({filteredExp.length} items)
                        </td>
                        <td style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 900, color: '#e63946', fontSize: 16, borderTop: '1px solid var(--border)' }}>
                          -{fmt(filteredExp.reduce((s, x) => s + x.amount, 0))}
                        </td>
                        <td style={{ borderTop: '1px solid var(--border)' }} />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : <Empty msg={expenses.length === 0 ? 'No expenses yet. Click "+ Add Expense" to get started.' : 'No results match your current filters.'} />}
            </div>
          </div>
        )}

        {/* INCOME */}
        {tab === 'income' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 900, letterSpacing: -.5, color: 'var(--text)' }}>Income</h2>
                <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 3 }}>{filteredInc.length} records &nbsp;·&nbsp; {fmt(filteredInc.reduce((s, x) => s + x.amount, 0))} total</p>
              </div>
              <Btn variant="green" onClick={openAddInc}>+ Add Income</Btn>
            </div>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 16, marginBottom: 16, display: 'flex', gap: 12 }}>
              <Input2 placeholder="Search source or category..." value={incSearch} onChange={e => setIncSearch(e.target.value)} />
              <Sel2 value={incFilterCat} onChange={e => setIncFilterCat(e.target.value)}>
                <option value="all">All Categories</option>
                {INC_CATS.map(c => <option key={c}>{c}</option>)}
              </Sel2>
            </div>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
              {filteredInc.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ background: dark ? '#1c2129' : '#f6f8fa' }}>
                    <tr>{['Source', 'Category', 'Date', 'Note', 'Amount', ''].map(h => (
                      <th key={h} style={{
                        fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--muted)',
                        padding: '10px 16px', textAlign: 'left', borderBottom: '1px solid var(--border)'
                      }}>{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {filteredInc.map(inc => (
                      <tr key={inc.id} className="tr-hover" style={{ background: 'var(--surface)' }}>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontWeight: 600, color: 'var(--text)' }}>{inc.source}</td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}><Tag label={inc.category} /></td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 12, color: 'var(--muted)' }}>{inc.date}</td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 12, color: 'var(--muted)', maxWidth: 180 }}>{inc.note || '—'}</td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', textAlign: 'right', fontWeight: 800, color: '#2d6a4f', fontSize: 15 }}>+{fmt(inc.amount)}</td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <button onClick={() => openEditInc(inc)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#0077b6', fontSize: 11, fontWeight: 700, padding: '4px 6px' }}>Edit</button>
                          <button onClick={() => deleteInc(inc.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#e63946', fontSize: 11, fontWeight: 700, padding: '4px 6px' }}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot style={{ background: dark ? '#1c2129' : '#f6f8fa' }}>
                    <tr>
                      <td colSpan={4} style={{ padding: '10px 16px', fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--muted)', borderTop: '1px solid var(--border)' }}>Total</td>
                      <td style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 900, color: '#2d6a4f', fontSize: 16, borderTop: '1px solid var(--border)' }}>+{fmt(filteredInc.reduce((s, x) => s + x.amount, 0))}</td>
                      <td style={{ borderTop: '1px solid var(--border)' }} />
                    </tr>
                  </tfoot>
                </table>
              ) : <Empty msg="No income entries yet." />}
            </div>
          </div>
        )}

        {/* BUDGETS */}
        {tab === 'budgets' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 900, letterSpacing: -.5, color: 'var(--text)' }}>Budgets</h2>
                <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 3 }}>Monthly spending limits — tracked against current month</p>
              </div>
              <Btn onClick={() => { setBudForm(blankBud()); setBudModal(true) }}>+ Set Budget</Btn>
            </div>
            {budgets.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
                {budgets.map(b => {
                  const spent = catSpend(b.category, currentMonth())
                  const pct = b.amount > 0 ? (spent / b.amount) * 100 : 0
                  const remaining = b.amount - spent
                  const over = pct > 100
                  return (
                    <div key={b.id} style={{
                      background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 20,
                      borderLeft: `3px solid ${over ? '#e63946' : pct > 80 ? '#f4a261' : CAT_COLOR[b.category]}`
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                        <div>
                          <p style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)' }}>{b.category}</p>
                          <p style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2, textTransform: 'uppercase', letterSpacing: .8 }}>{b.period} limit</p>
                        </div>
                        <button onClick={() => deleteBud(b.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#e63946', fontSize: 11, fontWeight: 700 }}>Remove</button>
                      </div>
                      <Bar pct={pct} color={CAT_COLOR[b.category]} h={7} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginTop: 10 }}>
                        <span style={{ color: 'var(--muted)' }}>Spent <strong style={{ color: 'var(--text)' }}>{fmt(spent)}</strong></span>
                        <span style={{ color: 'var(--muted)' }}>of <strong style={{ color: 'var(--text)' }}>{fmt(b.amount)}</strong></span>
                      </div>
                      <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, color: over ? '#e63946' : pct > 80 ? '#f4a261' : '#2d6a4f', fontWeight: 700 }}>
                          {over ? `Over by ${fmt(-remaining)}` : `${fmt(remaining)} remaining`}
                        </span>
                        <span style={{
                          fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 4,
                          color: over ? '#e63946' : pct > 80 ? '#92400e' : '#2d6a4f',
                          background: over ? '#ffe5e5' : pct > 80 ? '#fef3c7' : '#d8f3dc'
                        }}>
                          {pct.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }}>
                <Empty msg='No budgets configured. Add spending limits to track your categories.' />
              </div>
            )}
          </div>
        )}

        {/* GOALS */}
        {tab === 'goals' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 900, letterSpacing: -.5, color: 'var(--text)' }}>Financial Goals</h2>
                <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 3 }}>Savings targets and milestones</p>
              </div>
              <Btn onClick={() => { setEditGoal(null); setGoalForm(blankGoal()); setGoalModal(true) }}>+ Add Goal</Btn>
            </div>
            {goals.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
                {goals.map(g => {
                  const pct = g.target > 0 ? (g.current / g.target) * 100 : 0
                  const done = pct >= 100
                  return (
                    <div key={g.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 22, borderTop: `3px solid ${g.color}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                        <div>
                          <p style={{ fontWeight: 800, fontSize: 16, color: 'var(--text)' }}>{g.name}</p>
                          {g.deadline && <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>Deadline: {g.deadline}</p>}
                        </div>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button onClick={() => { setEditGoal(g); setGoalForm({ ...g, target: String(g.target), current: String(g.current) }); setGoalModal(true) }}
                            style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#0077b6', fontSize: 11, fontWeight: 700 }}>Edit</button>
                          <button onClick={() => deleteGoal(g.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#e63946', fontSize: 11, fontWeight: 700 }}>Del</button>
                        </div>
                      </div>
                      <Bar pct={pct} color={g.color} h={8} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{fmt(g.current)}</span>
                        <span style={{ fontSize: 13, color: 'var(--muted)' }}>target: {fmt(g.target)}</span>
                      </div>
                      <div style={{ marginTop: 10 }}>
                        <span style={{
                          fontSize: 12, fontWeight: 800, padding: '3px 10px', borderRadius: 4,
                          color: done ? '#2d6a4f' : g.color, background: done ? '#d8f3dc' : 'var(--input-bg)'
                        }}>
                          {done ? 'Goal reached' : pct.toFixed(1) + '% complete'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }}>
                <Empty msg='No goals yet. Add savings targets to track progress.' />
              </div>
            )}
          </div>
        )}

        {/* RECURRING */}
        {tab === 'recurring' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 900, letterSpacing: -.5, color: 'var(--text)' }}>Recurring Rules</h2>
                <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 3 }}>Templates for regular income and expenses — apply manually when due</p>
              </div>
              <Btn onClick={() => { setRecurForm(blankRecur()); setRecurModal(true) }}>+ Add Rule</Btn>
            </div>
            {recurring.length > 0 ? (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ background: dark ? '#1c2129' : '#f6f8fa' }}>
                    <tr>{['Description', 'Type', 'Amount', 'Category', 'Frequency', 'Next Date', 'Status', ''].map(h => (
                      <th key={h} style={{
                        fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
                        color: 'var(--muted)', padding: '10px 16px', textAlign: 'left', borderBottom: '1px solid var(--border)'
                      }}>{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {recurring.map(r => (
                      <tr key={r.id} className="tr-hover" style={{ background: 'var(--surface)', opacity: r.active ? 1 : .5 }}>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontWeight: 600, color: 'var(--text)' }}>{r.description}</td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                          <span style={{
                            padding: '2px 10px', borderRadius: 4, fontSize: 11, fontWeight: 700,
                            background: r.type === 'expense' ? '#ffe5e5' : '#d8f3dc',
                            color: r.type === 'expense' ? '#e63946' : '#2d6a4f', textTransform: 'capitalize'
                          }}>
                            {r.type}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontWeight: 700, color: r.type === 'expense' ? '#e63946' : '#2d6a4f' }}>{fmt(r.amount)}</td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}><Tag label={r.category} /></td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 12, color: 'var(--muted)', textTransform: 'capitalize' }}>{r.frequency}</td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 12, color: 'var(--muted)' }}>{r.nextDate}</td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                          <button onClick={() => toggleRecur(r.id)}
                            style={{
                              border: `1px solid ${r.active ? '#2d6a4f' : 'var(--border)'}`,
                              background: r.active ? '#d8f3dc' : 'transparent',
                              color: r.active ? '#2d6a4f' : 'var(--muted)',
                              padding: '3px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 700
                            }}>
                            {r.active ? 'Active' : 'Paused'}
                          </button>
                        </td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          {r.active && <button onClick={() => applyRecur(r)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#0077b6', fontSize: 11, fontWeight: 700, padding: '4px 6px' }}>Apply Now</button>}
                          <button onClick={() => deleteRecur(r.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#e63946', fontSize: 11, fontWeight: 700, padding: '4px 6px' }}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }}>
                <Empty msg='No recurring rules. Add templates for rent, salary, subscriptions, etc.' />
              </div>
            )}
          </div>
        )}

        {/* REPORTS */}
        {tab === 'reports' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 22, fontWeight: 900, letterSpacing: -.5, color: 'var(--text)' }}>Reports</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>Period</span>
                <input type="month" value={reportMonth} onChange={e => setReportMonth(e.target.value)}
                  style={{
                    border: '1px solid var(--border)', borderRadius: 6, padding: '7px 12px', fontSize: 13,
                    background: 'var(--surface)', color: 'var(--text)', fontFamily: 'inherit'
                  }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 22 }}>
              <KPI label="Expenses" value={fmt(reportData.totalE)} color="#e63946" />
              <KPI label="Income" value={fmt(reportData.totalI)} color="#2d6a4f" />
              <KPI label="Net" value={fmt(reportData.totalI - reportData.totalE)} color={reportData.totalI - reportData.totalE >= 0 ? '#0077b6' : '#e63946'} />
              <KPI label="Transactions" value={reportData.exps.length + reportData.incs.length} color="#7b2d8b" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 24 }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 20 }}>Expense Breakdown</p>
                {reportData.byCategory.length > 0 ? reportData.byCategory.map(r => {
                  const pct = reportData.totalE > 0 ? (r.amount / reportData.totalE) * 100 : 0
                  return (
                    <div key={r.cat} style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}><Dot color={CAT_COLOR[r.cat]} />{r.cat}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{fmt(r.amount)} <span style={{ color: 'var(--muted)', fontWeight: 400, fontSize: 11 }}>({pct.toFixed(1)}%)</span></span>
                      </div>
                      <Bar pct={pct} color={CAT_COLOR[r.cat]} />
                    </div>
                  )
                }) : <Empty msg="No expenses this period." />}
              </div>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 24 }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 20 }}>Income Sources</p>
                {reportData.byIncCat.length > 0 ? reportData.byIncCat.map(r => {
                  const pct = reportData.totalI > 0 ? (r.amount / reportData.totalI) * 100 : 0
                  return (
                    <div key={r.cat} style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}><Dot color={CAT_COLOR[r.cat]} />{r.cat}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{fmt(r.amount)} <span style={{ color: 'var(--muted)', fontWeight: 400, fontSize: 11 }}>({pct.toFixed(1)}%)</span></span>
                      </div>
                      <Bar pct={pct} color={CAT_COLOR[r.cat]} />
                    </div>
                  )
                }) : <Empty msg="No income this period." />}
              </div>
            </div>

            {reportData.exps.length > 0 && (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
                  <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--muted)' }}>All Expenses — {reportMonth}</p>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ background: dark ? '#1c2129' : '#f6f8fa' }}>
                    <tr>{['Date', 'Description', 'Category', 'Amount'].map(h => (
                      <th key={h} style={{
                        fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--muted)',
                        padding: '10px 16px', textAlign: 'left', borderBottom: '1px solid var(--border)'
                      }}>{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {reportData.exps.sort((a, b) => b.date.localeCompare(a.date)).map(e => (
                      <tr key={e.id} className="tr-hover" style={{ background: 'var(--surface)' }}>
                        <td style={{ padding: '11px 16px', borderBottom: '1px solid var(--border)', fontSize: 12, color: 'var(--muted)' }}>{e.date}</td>
                        <td style={{ padding: '11px 16px', borderBottom: '1px solid var(--border)', fontWeight: 600, color: 'var(--text)' }}>{e.description}</td>
                        <td style={{ padding: '11px 16px', borderBottom: '1px solid var(--border)' }}><Tag label={e.category} /></td>
                        <td style={{ padding: '11px 16px', borderBottom: '1px solid var(--border)', textAlign: 'right', fontWeight: 700, color: '#e63946' }}>{fmt(e.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* NOTES */}
        {tab === 'notes' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 900, letterSpacing: -.5, color: 'var(--text)' }}>Notes</h2>
                <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 3 }}>Financial journal, reminders and memos</p>
              </div>
              <Btn variant="amber" onClick={() => { setEditNote(null); setNoteForm(blankNote()); setNoteModal(true) }}>+ Add Note</Btn>
            </div>
            {notes.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
                {notes.slice().sort((a, b) => b.date.localeCompare(a.date)).map(n => (
                  <div key={n.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 20, borderTop: '2px solid #e9c46a' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                      <p style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)' }}>{n.title}</p>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => { setEditNote(n); setNoteForm({ ...n }); setNoteModal(true) }}
                          style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#0077b6', fontSize: 11, fontWeight: 700 }}>Edit</button>
                        <button onClick={() => deleteNote(n.id)}
                          style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#e63946', fontSize: 11, fontWeight: 700 }}>Delete</button>
                      </div>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{n.body || '—'}</p>
                    <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 14, borderTop: '1px solid var(--border)', paddingTop: 8 }}>{n.date}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }}>
                <Empty msg='No notes. Add financial reminders, journal entries or action items.' />
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODALS */}
      {expModal && (
        <Modal title={editExp ? 'Edit Expense' : 'Add Expense'} onClose={() => setExpModal(false)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ gridColumn: '1/-1' }}><Input2 label="Description *" type="text" placeholder="e.g. Grocery run" value={expForm.description} onChange={e => setExpForm({ ...expForm, description: e.target.value })} /></div>
            <Input2 label="Amount ($) *" type="number" min="0.01" step="0.01" placeholder="0.00" value={expForm.amount} onChange={e => setExpForm({ ...expForm, amount: e.target.value })} />
            <Input2 label="Date *" type="date" value={expForm.date} onChange={e => setExpForm({ ...expForm, date: e.target.value })} />
            <div style={{ gridColumn: '1/-1' }}><Sel2 label="Category" value={expForm.category} onChange={e => setExpForm({ ...expForm, category: e.target.value })}>{EXP_CATS.map(c => <option key={c}>{c}</option>)}</Sel2></div>
            <div style={{ gridColumn: '1/-1' }}><Input2 label="Tags (comma-separated)" placeholder="work, tax-deductible, personal" value={expForm.tags} onChange={e => setExpForm({ ...expForm, tags: e.target.value })} /></div>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: .8, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: 5 }}>Note (optional)</label>
              <textarea value={expForm.note} onChange={e => setExpForm({ ...expForm, note: e.target.value })} rows={2} placeholder="Optional memo"
                style={{ border: '1px solid var(--border)', borderRadius: 6, padding: '9px 12px', fontSize: 14, background: 'var(--input-bg)',
                  color: 'var(--text)', width: '100%', fontFamily: 'inherit', resize: 'vertical' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <Btn style={{ flex: 1, justifyContent: 'center' }} onClick={submitExp}>{editExp ? 'Update Expense' : 'Add Expense'}</Btn>
            <Btn variant="ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setExpModal(false)}>Cancel</Btn>
          </div>
        </Modal>
      )}

      {incModal && (
        <Modal title={editInc ? 'Edit Income' : 'Add Income'} onClose={() => setIncModal(false)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ gridColumn: '1/-1' }}><Input2 label="Source *" type="text" placeholder="e.g. Monthly salary" value={incForm.source} onChange={e => setIncForm({ ...incForm, source: e.target.value })} /></div>
            <Input2 label="Amount ($) *" type="number" min="0.01" step="0.01" placeholder="0.00" value={incForm.amount} onChange={e => setIncForm({ ...incForm, amount: e.target.value })} />
            <Input2 label="Date *" type="date" value={incForm.date} onChange={e => setIncForm({ ...incForm, date: e.target.value })} />
            <div style={{ gridColumn: '1/-1' }}><Sel2 label="Category" value={incForm.category} onChange={e => setIncForm({ ...incForm, category: e.target.value })}>{INC_CATS.map(c => <option key={c}>{c}</option>)}</Sel2></div>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: .8, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: 5 }}>Note (optional)</label>
              <textarea value={incForm.note} onChange={e => setIncForm({ ...incForm, note: e.target.value })} rows={2}
                style={{ border: '1px solid var(--border)', borderRadius: 6, padding: '9px 12px', fontSize: 14, background: 'var(--input-bg)', color: 'var(--text)', width: '100%', fontFamily: 'inherit', resize: 'vertical' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <Btn variant="green" style={{ flex: 1, justifyContent: 'center' }} onClick={submitInc}>{editInc ? 'Update Income' : 'Add Income'}</Btn>
            <Btn variant="ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setIncModal(false)}>Cancel</Btn>
          </div>
        </Modal>
      )}

      {budModal && (
        <Modal title="Set Budget Limit" onClose={() => setBudModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Sel2 label="Category" value={budForm.category} onChange={e => setBudForm({ ...budForm, category: e.target.value })}>{EXP_CATS.map(c => <option key={c}>{c}</option>)}</Sel2>
            <Input2 label="Monthly Limit ($)" type="number" min="1" step="1" placeholder="500" value={budForm.amount} onChange={e => setBudForm({ ...budForm, amount: e.target.value })} />
            <Sel2 label="Period" value={budForm.period} onChange={e => setBudForm({ ...budForm, period: e.target.value })}>
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
              <option value="yearly">Yearly</option>
            </Sel2>
            <p style={{ fontSize: 12, color: 'var(--muted)' }}>If a budget for this category already exists, it will be updated.</p>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <Btn variant="amber" style={{ flex: 1, justifyContent: 'center' }} onClick={submitBud}>Save Budget</Btn>
            <Btn variant="ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setBudModal(false)}>Cancel</Btn>
          </div>
        </Modal>
      )}

      {recurModal && (
        <Modal title="Add Recurring Rule" onClose={() => setRecurModal(false)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ gridColumn: '1/-1' }}><Input2 label="Description *" type="text" placeholder="e.g. Netflix, Rent, Paycheck" value={recurForm.description} onChange={e => setRecurForm({ ...recurForm, description: e.target.value })} /></div>
            <Input2 label="Amount ($) *" type="number" min="0.01" step="0.01" placeholder="0.00" value={recurForm.amount} onChange={e => setRecurForm({ ...recurForm, amount: e.target.value })} />
            <Input2 label="Next Date" type="date" value={recurForm.nextDate} onChange={e => setRecurForm({ ...recurForm, nextDate: e.target.value })} />
            <Sel2 label="Category" value={recurForm.category} onChange={e => setRecurForm({ ...recurForm, category: e.target.value })}>{EXP_CATS.map(c => <option key={c}>{c}</option>)}</Sel2>
            <Sel2 label="Frequency" value={recurForm.frequency} onChange={e => setRecurForm({ ...recurForm, frequency: e.target.value })}>
              {['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'].map(f => <option key={f}>{f}</option>)}
            </Sel2>
            <div style={{ gridColumn: '1/-1' }}>
              <Sel2 label="Type" value={recurForm.type} onChange={e => setRecurForm({ ...recurForm, type: e.target.value as 'expense' | 'income' })}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </Sel2>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <Btn style={{ flex: 1, justifyContent: 'center' }} onClick={submitRecur}>Save Rule</Btn>
            <Btn variant="ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setRecurModal(false)}>Cancel</Btn>
          </div>
        </Modal>
      )}

      {noteModal && (
        <Modal title={editNote ? 'Edit Note' : 'Add Note'} onClose={() => setNoteModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input2 label="Title *" type="text" placeholder="Note title" value={noteForm.title} onChange={e => setNoteForm({ ...noteForm, title: e.target.value })} />
            <Input2 label="Date" type="date" value={noteForm.date} onChange={e => setNoteForm({ ...noteForm, date: e.target.value })} />
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: .8, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: 5 }}>Body</label>
              <textarea value={noteForm.body} onChange={e => setNoteForm({ ...noteForm, body: e.target.value })} rows={6}
                placeholder="Write your financial notes, reminders or plans..."
                style={{ border: '1px solid var(--border)', borderRadius: 6, padding: '9px 12px', fontSize: 14, background: 'var(--input-bg)',
                  color: 'var(--text)', width: '100%', fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.6 }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <Btn variant="amber" style={{ flex: 1, justifyContent: 'center' }} onClick={submitNote}>{editNote ? 'Update' : 'Save Note'}</Btn>
            <Btn variant="ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setNoteModal(false)}>Cancel</Btn>
          </div>
        </Modal>
      )}

      {goalModal && (
        <Modal title={editGoal ? 'Edit Goal' : 'Add Financial Goal'} onClose={() => setGoalModal(false)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ gridColumn: '1/-1' }}><Input2 label="Goal Name *" type="text" placeholder="e.g. Emergency Fund, New Car" value={goalForm.name} onChange={e => setGoalForm({ ...goalForm, name: e.target.value })} /></div>
            <Input2 label="Target Amount ($) *" type="number" min="1" placeholder="10000" value={goalForm.target} onChange={e => setGoalForm({ ...goalForm, target: e.target.value })} />
            <Input2 label="Current Amount ($)" type="number" min="0" placeholder="0" value={goalForm.current} onChange={e => setGoalForm({ ...goalForm, current: e.target.value })} />
            <Input2 label="Deadline (optional)" type="date" value={goalForm.deadline} onChange={e => setGoalForm({ ...goalForm, deadline: e.target.value })} />
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: .8, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: 5 }}>Accent Color</label>
              <input type="color" value={goalForm.color} onChange={e => setGoalForm({ ...goalForm, color: e.target.value })}
                style={{ width: '100%', height: 40, border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', background: 'var(--input-bg)', padding: 4 }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <Btn style={{ flex: 1, justifyContent: 'center' }} onClick={submitGoal}>{editGoal ? 'Update' : 'Add Goal'}</Btn>
            <Btn variant="ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setGoalModal(false)}>Cancel</Btn>
          </div>
        </Modal>
      )}

      {bulkModal && (
        <Modal title="Bulk Import Expenses" onClose={() => setBulkModal(false)} wide>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 14, lineHeight: 1.65 }}>
            Paste CSV data, one row per line. Format: <code style={{ background: 'var(--input-bg)', padding: '2px 6px', borderRadius: 4, fontSize: 12, border: '1px solid var(--border)' }}>Description, Amount, Category, Date</code>
            <br />Example: <code style={{ background: 'var(--input-bg)', padding: '2px 6px', borderRadius: 4, fontSize: 12, border: '1px solid var(--border)' }}>Coffee shop, 4.50, Food, 2025-05-10</code>
            <br />Date is optional (defaults to today). Category must match exactly or defaults to &quot;Other&quot;.
          </p>
          <textarea value={bulkText} onChange={e => setBulkText(e.target.value)} rows={10}
            placeholder={"Coffee shop, 4.50, Food, 2025-05-10\nBus pass, 45.00, Transport, 2025-05-01\nNetflix, 15.99, Entertainment"}
            style={{ border: '1px solid var(--border)', borderRadius: 6, padding: '12px', fontSize: 13, background: 'var(--input-bg)',
              color: 'var(--text)', width: '100%', fontFamily: 'monospace', resize: 'vertical', lineHeight: 1.6 }} />
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <Btn style={{ flex: 1, justifyContent: 'center' }} onClick={processBulk}>Import Rows</Btn>
            <Btn variant="ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setBulkModal(false)}>Cancel</Btn>
          </div>
        </Modal>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  )
}