
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  PiggyBank, 
  Heart, 
  Plus, 
  X,
  Trash2,
  ChevronLeft as BackIcon,
  BookOpen,
  ClipboardList,
  ListTodo,
  Activity,
  CalendarCheck,
  ShoppingCart,
  Stethoscope,
  Utensils,
  Layers,
  Settings,
  FileText,
  LucideIcon,
  Film,
  Music,
  Droplets,
  ShoppingBag,
  Coffee,
  Dumbbell,
  Book,
  Plane,
  Star,
  Smile,
  Moon,
  Wine,
  Camera,
  Heart as HeartIcon
} from 'lucide-react';
import { 
  format, 
  addMonths, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  getDay, 
  addDays
} from 'date-fns';
import { es } from 'date-fns/locale/es';
import { AppState, ViewState, NoteData, MonthlyExpenses, Savings, HealthData, CustomTable } from './types';
import { loadData, saveData } from './utils/storage';

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const ICON_MAP: Record<string, LucideIcon> = {
  ClipboardList,
  ListTodo,
  FileText,
  CalendarCheck,
  Activity,
  Droplets, // Period/Water
  HeartIcon,
  Stethoscope,
  ShoppingCart,
  ShoppingBag,
  Film, // Cinema
  Music,
  Coffee,
  Utensils,
  Dumbbell, // Gym
  Book,
  Plane, // Travel
  Camera,
  Wine,
  Moon,
  Star,
  Smile,
  Settings
};

const COLORS = [
  '#000000', '#4B5563', '#9CA3AF', 
  '#EF4444', '#F59E0B', '#10B981', 
  '#3B82F6', '#8B5CF6', '#EC4899'
];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('calendar');
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [data, setData] = useState<AppState>(loadData());

  useEffect(() => {
    saveData(data);
  }, [data]);

  const handlePrevMonth = () => setViewDate(addMonths(viewDate, -1));
  const handleNextMonth = () => setViewDate(addMonths(viewDate, 1));
  const handlePrevYear = () => setViewDate(addMonths(viewDate, -12));
  const handleNextYear = () => setViewDate(addMonths(viewDate, 12));

  const updateNotes = (dateKey: string, text: string) => {
    setData(prev => ({ ...prev, notes: { ...prev.notes, [dateKey]: text } }));
  };

  const updateMonthlyNotes = (monthKey: string, text: string) => {
    setData(prev => ({ ...prev, monthlyNotes: { ...prev.monthlyNotes, [monthKey]: text } }));
  };

  const updateExpenses = (monthKey: string, expenses: any[]) => {
    setData(prev => ({ ...prev, expenses: { ...prev.expenses, [monthKey]: expenses } }));
  };

  const updateSavings = (yearKey: string, month: string, amount: number) => {
    setData(prev => {
      const yearSavings = prev.savings[yearKey] || {};
      return { ...prev, savings: { ...prev.savings, [yearKey]: { ...yearSavings, [month]: amount } } };
    });
  };

  const updateHealth = (yearKey: string, items: any[]) => {
    setData(prev => ({ ...prev, health: { ...prev.health, [yearKey]: items } }));
  };

  const addCustomTable = (yearKey: string, table: CustomTable) => {
    setData(prev => {
      const yearTables = prev.customTables[yearKey] || [];
      return { ...prev, customTables: { ...prev.customTables, [yearKey]: [...yearTables, table] } };
    });
  };

  const updateCustomTableRows = (yearKey: string, tableId: string, rows: any[]) => {
    setData(prev => {
      const yearTables = prev.customTables[yearKey] || [];
      const updatedTables = yearTables.map(t => t.id === tableId ? { ...t, rows } : t);
      return { ...prev, customTables: { ...prev.customTables, [yearKey]: updatedTables } };
    });
  };

  const deleteCustomTable = (yearKey: string, tableId: string) => {
    setData(prev => {
      const yearTables = prev.customTables[yearKey] || [];
      const updatedTables = yearTables.filter(t => t.id !== tableId);
      return { ...prev, customTables: { ...prev.customTables, [yearKey]: updatedTables } };
    });
  };

  const currentYear = format(viewDate, 'yyyy');
  const currentMonthKey = format(viewDate, 'yyyy-MM');
  const isAnnualView = ['summary', 'savings', 'health', 'custom', 'customTableDetail'].includes(currentView);

  const renderView = () => {
    switch (currentView) {
      case 'calendar':
        return (
          <div className="flex flex-col h-full animate-fadeIn">
            <div className="flex items-center justify-between mb-8 px-2">
              <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ChevronLeft size={24} />
              </button>
              <h2 className="text-xl font-light uppercase tracking-widest text-center flex flex-col items-center">
                <span className="text-sm opacity-60 mb-1">{format(viewDate, 'MMMM', { locale: es })}</span>
                <button 
                  onClick={() => setCurrentView('summary')}
                  className="hover:underline underline-offset-4 decoration-1 font-medium text-2xl"
                >
                  {currentYear}
                </button>
              </h2>
              <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ChevronRight size={24} />
              </button>
            </div>

            <div className="grid grid-cols-7 mb-4">
              {WEEKDAYS.map(day => (
                <div key={day} className="text-center text-xs font-semibold text-gray-400 uppercase">{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-y-4">
              {renderCalendarDays()}
            </div>

            <div className="mt-12 flex flex-col items-center gap-4">
              <button 
                onClick={() => setCurrentView('expenses')}
                className="w-full max-w-xs border border-black py-4 text-sm font-medium hover:bg-black hover:text-white transition-all uppercase tracking-widest"
              >
                Gestor de gastos
              </button>
              <button 
                onClick={() => setCurrentView('monthlyNotes')}
                className="w-full max-w-xs border border-black py-4 text-sm font-medium hover:bg-black hover:text-white transition-all uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <BookOpen size={16} /> Notas del mes
              </button>
            </div>
          </div>
        );

      case 'expenses':
        return <ExpensesView date={viewDate} data={data.expenses} onUpdate={updateExpenses} onBack={() => setCurrentView('calendar')} />;
      
      case 'diary':
        return (
          <DiaryView 
            date={selectedDate!} 
            note={data.notes[format(selectedDate!, 'yyyy-MM-dd')] || ''} 
            onUpdate={updateNotes} 
            onBack={() => setCurrentView('calendar')} 
            onPrevDay={() => setSelectedDate(prev => prev ? addDays(prev, -1) : null)}
            onNextDay={() => setSelectedDate(prev => prev ? addDays(prev, 1) : null)}
          />
        );

      case 'monthlyNotes':
        return (
          <MonthlyNotesView 
            date={viewDate} 
            note={data.monthlyNotes[currentMonthKey] || ''} 
            onUpdate={updateMonthlyNotes} 
            onBack={() => setCurrentView('calendar')} 
          />
        );
      
      case 'savings':
        return <SavingsView date={viewDate} data={data.savings} onUpdate={updateSavings} onBack={() => setCurrentView('summary')} />;
      
      case 'health':
        return <HealthView date={viewDate} data={data.health} onUpdate={updateHealth} onBack={() => setCurrentView('summary')} />;

      case 'custom':
        return (
          <CustomTableView 
            year={currentYear} 
            tables={data.customTables[currentYear] || []} 
            onAddTable={addCustomTable} 
            onSelectTable={(id) => {
              setSelectedTableId(id);
              setCurrentView('customTableDetail');
            }}
            onBack={() => setCurrentView('summary')} 
          />
        );

      case 'customTableDetail':
        const table = (data.customTables[currentYear] || []).find(t => t.id === selectedTableId);
        if (!table) return null;
        return (
          <CustomTableDetailView 
            year={currentYear}
            table={table}
            onUpdateRows={updateCustomTableRows}
            onDeleteTable={(y, id) => {
              deleteCustomTable(y, id);
              setCurrentView('custom');
            }}
            onBack={() => setCurrentView('custom')}
          />
        );

      case 'summary':
        return (
          <AnnualSummaryView 
            year={currentYear} 
            expensesData={data.expenses} 
            onBack={() => setCurrentView('calendar')} 
            onPrevYear={handlePrevYear}
            onNextYear={handleNextYear}
          />
        );

      default:
        return null;
    }
  };

  const renderCalendarDays = () => {
    const start = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const end = endOfMonth(viewDate);
    const days = eachDayOfInterval({ start, end });
    let startDay = getDay(start);
    startDay = (startDay === 0) ? 6 : startDay - 1;
    const blanks = Array(startDay).fill(null);
    
    return [...blanks, ...days].map((day, i) => {
      if (!day) return <div key={`blank-${i}`} />;
      const isToday = isSameDay(day, new Date());
      const dateKey = format(day, 'yyyy-MM-dd');
      const hasNote = data.notes[dateKey];

      return (
        <button
          key={dateKey}
          onClick={() => {
            setSelectedDate(day);
            setCurrentView('diary');
          }}
          className={`relative aspect-square flex flex-col items-center justify-center text-lg transition-all ${isToday ? 'font-bold underline' : 'font-light'} hover:bg-gray-50`}
        >
          {day.getDate()}
          {hasNote && <div className="absolute bottom-1 w-1 h-1 bg-black rounded-full" />}
        </button>
      );
    });
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white text-black flex flex-col p-6 pb-24 select-none">
      <header className="mb-8 pt-4">
        <h1 className="text-3xl font-light tracking-tighter text-center cursor-pointer" onClick={() => setCurrentView('calendar')}>notebk</h1>
      </header>

      <main className="flex-1 overflow-y-auto">
        {renderView()}
      </main>

      {isAnnualView && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-8 py-4 flex justify-between items-center max-w-md mx-auto z-50">
          <button 
            onClick={() => setCurrentView('savings')}
            className={`p-3 transition-transform active:scale-90 ${currentView === 'savings' ? 'scale-110' : 'opacity-40'}`}
          >
            <PiggyBank size={28} strokeWidth={1.5} />
          </button>
          <button 
            onClick={() => setCurrentView('summary')}
            className={`p-3 transition-transform active:scale-90 ${currentView === 'summary' ? 'scale-110' : 'opacity-40'}`}
          >
            <span className="text-xs font-bold uppercase tracking-tighter">{currentYear}</span>
          </button>
          <button 
            onClick={() => setCurrentView('health')}
            className={`p-3 transition-transform active:scale-90 ${currentView === 'health' ? 'scale-110' : 'opacity-40'}`}
          >
            <Heart size={28} strokeWidth={1.5} />
          </button>
          <button 
            onClick={() => setCurrentView('custom')}
            className={`p-3 transition-transform active:scale-90 ${['custom', 'customTableDetail'].includes(currentView) ? 'scale-110' : 'opacity-40'}`}
          >
            <Plus size={28} strokeWidth={1.5} />
          </button>
        </nav>
      )}
    </div>
  );
};

// --- Sub-components ---

const CustomTableView: React.FC<{ 
  year: string, 
  tables: CustomTable[], 
  onAddTable: (y: string, t: CustomTable) => void, 
  onSelectTable: (id: string) => void,
  onBack: () => void 
}> = ({ year, tables, onAddTable, onSelectTable, onBack }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCol1, setNewCol1] = useState('');
  const [newCol2, setNewCol2] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState('ClipboardList');

  const handleCreate = () => {
    if (!newTitle) return;
    onAddTable(year, { 
      id: Date.now().toString(), 
      title: newTitle, 
      col1Title: newCol1 || 'Columna 1', 
      col2Title: newCol2 || 'Columna 2', 
      color: selectedColor,
      icon: selectedIcon,
      rows: [] 
    });
    setNewTitle(''); setNewCol1(''); setNewCol2(''); 
    setSelectedColor(COLORS[0]); setSelectedIcon('ClipboardList');
    setShowAdd(false);
  };

  return (
    <div className="flex flex-col h-full animate-slideIn pb-12">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack}><BackIcon size={24} /></button>
        <h2 className="text-xl font-light uppercase tracking-widest">Listas {year}</h2>
      </div>

      <button 
        onClick={() => setShowAdd(true)} 
        className="mb-8 border border-dashed border-gray-200 py-4 text-xs font-medium uppercase tracking-widest hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors rounded-sm"
      >
        <Plus size={16} /> Crear Nueva Lista
      </button>

      {showAdd && (
        <div className="fixed inset-0 bg-white z-[100] p-6 flex flex-col overflow-y-auto animate-fadeIn">
          <div className="flex justify-between items-center mb-8">
             <h3 className="text-xl font-light uppercase tracking-widest">Configurar Lista</h3>
             <button onClick={() => setShowAdd(false)}><X size={28} /></button>
          </div>
          <div className="space-y-6">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-bold opacity-40">Título</label>
              <input value={newTitle} onChange={e => setNewTitle(e.target.value)} className="border-b border-black py-2" placeholder="Ej: Registro Menstrual" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold opacity-40">Columna 1</label>
                <input value={newCol1} onChange={e => setNewCol1(e.target.value)} className="border-b border-black py-2" placeholder="Ej: Fecha" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold opacity-40">Columna 2</label>
                <input value={newCol2} onChange={e => setNewCol2(e.target.value)} className="border-b border-black py-2" placeholder="Ej: Notas" />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[10px] uppercase font-bold opacity-40">Icono</label>
              <div className="grid grid-cols-5 gap-2">
                {Object.keys(ICON_MAP).map(iconName => {
                  const Icon = ICON_MAP[iconName];
                  return (
                    <button 
                      key={iconName}
                      onClick={() => setSelectedIcon(iconName)}
                      className={`w-12 h-12 flex items-center justify-center rounded-full transition-all border-2 ${selectedIcon === iconName ? 'bg-gray-100 border-black' : 'bg-white border-transparent hover:bg-gray-50'}`}
                    >
                      <Icon size={20} color="black" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[10px] uppercase font-bold opacity-40">Color de Acento</label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map(color => (
                  <button 
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-transform ${selectedColor === color ? 'border-black scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <button onClick={handleCreate} className="w-full bg-black text-white py-4 font-medium uppercase tracking-widest mt-4">Crear Lista</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {tables.length === 0 ? (
          <p className="text-center text-sm font-light italic opacity-40 mt-12">No hay listas creadas aún.</p>
        ) : (
          tables.map(table => {
            const Icon = ICON_MAP[table.icon] || ClipboardList;
            return (
              <button 
                key={table.id}
                onClick={() => onSelectTable(table.id)}
                className="w-full border border-gray-100 p-4 flex items-center justify-between group hover:bg-gray-50 transition-all rounded-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center" style={{ color: table.color }}>
                    <Icon size={20} />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium uppercase tracking-widest">{table.title}</span>
                    <span className="text-[10px] uppercase opacity-40">{table.rows.length} registros</span>
                  </div>
                </div>
                <ChevronRight size={18} className="opacity-20 group-hover:opacity-100 transition-opacity" />
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

const CustomTableDetailView: React.FC<{
  year: string,
  table: CustomTable,
  onUpdateRows: (y: string, tid: string, rows: any[]) => void,
  onDeleteTable: (y: string, tid: string) => void,
  onBack: () => void
}> = ({ year, table, onUpdateRows, onDeleteTable, onBack }) => {
  const Icon = ICON_MAP[table.icon] || ClipboardList;

  return (
    <div className="flex flex-col h-full animate-slideIn pb-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onBack}><BackIcon size={24} /></button>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center" style={{ color: table.color }}>
                <Icon size={20} />
             </div>
             <h2 className="text-xl font-light uppercase tracking-widest">{table.title}</h2>
          </div>
        </div>
        <button 
          onClick={() => {
            if(confirm('¿Estás seguro de que quieres eliminar esta lista?')) {
              onDeleteTable(year, table.id);
            }
          }} 
          className="opacity-40 hover:opacity-100 p-2"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-black text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-black p-2 font-light uppercase text-xs" style={{ borderBottomColor: table.color, borderBottomWidth: '2px' }}>
                {table.col1Title}
              </th>
              <th className="border border-black p-2 font-light uppercase text-xs" style={{ borderBottomColor: table.color, borderBottomWidth: '2px' }}>
                {table.col2Title}
              </th>
            </tr>
          </thead>
          <tbody>
            <EditableTableRows 
              initialRows={table.rows} 
              onSave={(rows) => onUpdateRows(year, table.id, rows)} 
              accentColor={table.color}
            />
          </tbody>
        </table>
      </div>
    </div>
  );
};

const EditableTableRows: React.FC<{ 
  initialRows: any[], 
  onSave: (rows: any[]) => void,
  accentColor: string
}> = ({ initialRows, onSave, accentColor }) => {
  const [rows, setRows] = useState(initialRows);
  useEffect(() => { setRows(initialRows); }, [initialRows]);
  
  const addRow = () => {
    const newRows = [...rows, { id: Date.now().toString(), val1: '', val2: '' }];
    setRows(newRows);
    onSave(newRows);
  };

  const updateRow = (id: string, field: string, value: string) => {
    const updated = rows.map(r => r.id === id ? { ...r, [field]: value } : r);
    setRows(updated);
    onSave(updated);
  };

  const deleteRow = (id: string) => {
    const updated = rows.filter(r => r.id !== id);
    setRows(updated);
    onSave(updated);
  };

  return (
    <>
      {rows.map(row => (
        <tr key={row.id} className="group">
          <td className="border border-black p-0">
            <input 
              value={row.val1} 
              onChange={e => updateRow(row.id, 'val1', e.target.value)} 
              className="w-full p-2 bg-transparent focus:bg-gray-50" 
            />
          </td>
          <td className="border border-black p-0 relative">
            <input 
              value={row.val2} 
              onChange={e => updateRow(row.id, 'val2', e.target.value)} 
              className="w-full p-2 bg-transparent focus:bg-gray-50" 
            />
            <button 
              onClick={() => deleteRow(row.id)}
              className="absolute right-0 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white"
            >
              <X size={12} />
            </button>
          </td>
        </tr>
      ))}
      <tr>
        <td colSpan={2} className="p-0">
          <button 
            onClick={addRow} 
            className="w-full py-4 hover:bg-gray-50 text-[10px] uppercase font-bold tracking-widest transition-colors flex items-center justify-center gap-2"
            style={{ color: accentColor }}
          >
            <Plus size={12} /> Añadir Fila
          </button>
        </td>
      </tr>
    </>
  );
};

const MonthlyNotesView: React.FC<{ 
  date: Date, 
  note: string, 
  onUpdate: (m: string, t: string) => void, 
  onBack: () => void
}> = ({ date, note, onUpdate, onBack }) => {
  const monthKey = format(date, 'yyyy-MM');
  return (
    <div className="flex flex-col h-full animate-slideIn">
      <div className="flex items-center gap-4 mb-4">
        <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded-full transition-colors"><BackIcon size={24} /></button>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-widest opacity-40 leading-none mb-1">{format(date, 'yyyy', { locale: es })}</span>
          <h2 className="text-sm font-medium uppercase tracking-widest leading-none">Notas de {format(date, 'MMMM', { locale: es })}</h2>
        </div>
      </div>
      <div className="mt-4 flex-1">
        <textarea 
          value={note} 
          onChange={(e) => onUpdate(monthKey, e.target.value)} 
          placeholder="Escribe aquí las notas importantes del mes..." 
          className="w-full h-[65vh] p-4 bg-transparent border-l border-black resize-none leading-relaxed text-lg font-light italic focus:border-l-4 transition-all" 
        />
      </div>
    </div>
  );
};

const AnnualSummaryView: React.FC<{ 
  year: string, 
  expensesData: MonthlyExpenses, 
  onBack: () => void,
  onPrevYear: () => void,
  onNextYear: () => void
}> = ({ year, expensesData, onBack, onPrevYear, onNextYear }) => {
  const months = [
    { name: 'Enero', key: '01' }, { name: 'Febrero', key: '02' }, { name: 'Marzo', key: '03' },
    { name: 'Abril', key: '04' }, { name: 'Mayo', key: '05' }, { name: 'Junio', key: '06' },
    { name: 'Julio', key: '07' }, { name: 'Agosto', key: '08' }, { name: 'Septiembre', key: '09' },
    { name: 'Octubre', key: '10' }, { name: 'Noviembre', key: '11' }, { name: 'Diciembre', key: '12' }
  ];

  const monthStats = months.map(m => {
    const key = `${year}-${m.key}`;
    const monthlyList = expensesData[key] || [];
    const income = monthlyList.reduce((sum, item) => sum + (Number(item.income) || 0), 0);
    const expense = monthlyList.reduce((sum, item) => sum + (Number(item.expense) || 0), 0);
    const diff = income - expense;
    return { name: m.name, income, expense, diff };
  });

  const totals = monthStats.reduce((acc, curr) => ({
    income: acc.income + curr.income,
    expense: acc.expense + curr.expense,
    diff: acc.diff + curr.diff
  }), { income: 0, expense: 0, diff: 0 });

  const formatCurrency = (val: number) => `$${val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  
  const formatDiff = (val: number) => {
    const sign = val > 0 ? '+' : (val < 0 ? '-' : '');
    return `${sign}$${Math.abs(val).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  return (
    <div className="flex flex-col h-full animate-slideIn pb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded-full transition-colors"><BackIcon size={24} /></button>
          <h2 className="text-xl font-light uppercase tracking-widest">Resumen</h2>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onPrevYear} className="p-1 hover:bg-gray-100 rounded-full transition-colors"><ChevronLeft size={20} /></button>
          <span className="text-xl font-medium tracking-tighter">{year}</span>
          <button onClick={onNextYear} className="p-1 hover:bg-gray-100 rounded-full transition-colors"><ChevronRight size={20} /></button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-black text-[10px] sm:text-xs">
          <thead>
            <tr className="bg-black text-white">
              <th className="border border-black p-2 font-light uppercase text-left">Mes</th>
              <th className="border border-black p-2 font-light uppercase text-right">Ingresos</th>
              <th className="border border-black p-2 font-light uppercase text-right">Egresos</th>
              <th className="border border-black p-2 font-light uppercase text-right">Diferencia</th>
            </tr>
          </thead>
          <tbody>
            {monthStats.map(m => (
              <tr key={m.name}>
                <td className="border border-black p-2 uppercase font-light">{m.name}</td>
                <td className="border border-black p-2 text-right">{formatCurrency(m.income)}</td>
                <td className="border border-black p-2 text-right">{formatCurrency(m.expense)}</td>
                <td className={`border border-black p-2 text-right font-medium ${m.diff > 0 ? 'text-green-700' : m.diff < 0 ? 'text-red-700' : ''}`}>
                  {formatDiff(m.diff)}
                </td>
              </tr>
            ))}
            <tr className="bg-gray-100 font-bold">
              <td className="border border-black p-2 uppercase">TOTAL</td>
              <td className="border border-black p-2 text-right">{formatCurrency(totals.income)}</td>
              <td className="border border-black p-2 text-right">{formatCurrency(totals.expense)}</td>
              <td className={`border border-black p-2 text-right ${totals.diff > 0 ? 'text-green-700' : totals.diff < 0 ? 'text-red-700' : ''}`}>
                {formatDiff(totals.diff)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ExpensesView: React.FC<{ date: Date, data: MonthlyExpenses, onUpdate: (m: string, ex: any[]) => void, onBack: () => void }> = ({ date, data, onUpdate, onBack }) => {
  const monthKey = format(date, 'yyyy-MM');
  const expenses = data[monthKey] || [];

  const handleAdd = () => {
    const newEx = [...expenses, { id: Date.now().toString(), date: format(new Date(), 'dd/MM'), concept: '', income: 0, expense: 0 }];
    onUpdate(monthKey, newEx);
  };

  const handleUpdate = (id: string, field: string, value: any) => {
    const updated = expenses.map(ex => ex.id === id ? { ...ex, [field]: value } : ex);
    onUpdate(monthKey, updated);
  };

  const handleDelete = (id: string) => {
    const updated = expenses.filter(ex => ex.id !== id);
    onUpdate(monthKey, updated);
  };

  const totals = expenses.reduce((acc, curr) => ({
    income: acc.income + (Number(curr.income) || 0),
    expense: acc.expense + (Number(curr.expense) || 0)
  }), { income: 0, expense: 0 });

  return (
    <div className="flex flex-col h-full animate-slideIn">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack}><BackIcon size={24} /></button>
        <h2 className="text-xl font-light uppercase tracking-widest">{format(date, 'MMMM yyyy', { locale: es })}</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-black text-xs">
          <thead>
            <tr className="bg-black text-white">
              <th className="border border-black p-2 font-light uppercase">Fecha</th>
              <th className="border border-black p-2 font-light uppercase">Concepto</th>
              <th className="border border-black p-2 font-light uppercase">Ingresos</th>
              <th className="border border-black p-2 font-light uppercase">Egresos</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((ex) => (
              <tr key={ex.id}>
                <td className="border border-black p-0">
                  <input type="text" value={ex.date} onChange={e => handleUpdate(ex.id, 'date', e.target.value)} className="w-full p-2 bg-transparent text-center" placeholder="01/01" />
                </td>
                <td className="border border-black p-0">
                  <input type="text" value={ex.concept} onChange={e => handleUpdate(ex.id, 'concept', e.target.value)} className="w-full p-2 bg-transparent" />
                </td>
                <td className="border border-black p-0">
                  <input type="number" value={ex.income || ''} onChange={e => handleUpdate(ex.id, 'income', parseFloat(e.target.value))} className="w-full p-2 bg-transparent text-right" />
                </td>
                <td className="border border-black p-0">
                  <input type="number" value={ex.expense || ''} onChange={e => handleUpdate(ex.id, 'expense', parseFloat(e.target.value))} className="w-full p-2 bg-transparent text-right text-red-600" />
                </td>
                <td className="p-1">
                  <button onClick={() => handleDelete(ex.id)} className="p-1"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
            <tr className="bg-gray-50 font-bold">
              <td colSpan={2} className="border border-black p-2 text-right uppercase">Total:</td>
              <td className="border border-black p-2 text-right text-green-700">{totals.income.toFixed(2)}</td>
              <td className="border border-black p-2 text-right text-red-700">-{totals.expense.toFixed(2)}</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
      <button onClick={handleAdd} className="mt-6 self-center border border-black px-8 py-2 text-xs font-medium uppercase tracking-widest hover:bg-black hover:text-white transition-all">Añadir Fila</button>
    </div>
  );
};

const DiaryView: React.FC<{ date: Date, note: string, onUpdate: (d: string, t: string) => void, onBack: () => void, onPrevDay: () => void, onNextDay: () => void }> = ({ date, note, onUpdate, onBack, onPrevDay, onNextDay }) => {
  const dateKey = format(date, 'yyyy-MM-dd');
  return (
    <div className="flex flex-col h-full animate-slideIn">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded-full transition-colors"><BackIcon size={24} /></button>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest opacity-40 leading-none mb-1">{format(date, 'yyyy', { locale: es })}</span>
            <h2 className="text-sm font-medium uppercase tracking-widest leading-none">{format(date, 'EEEE, dd MMMM', { locale: es })}</h2>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onPrevDay} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ChevronLeft size={20} /></button>
          <button onClick={onNextDay} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ChevronRight size={20} /></button>
        </div>
      </div>
      <div className="mt-4 flex-1">
        <textarea value={note} onChange={(e) => onUpdate(dateKey, e.target.value)} placeholder="Escribe aquí tu diario..." className="w-full h-[60vh] p-4 bg-transparent border-l border-black resize-none leading-relaxed text-lg font-light italic focus:border-l-4 transition-all" />
      </div>
    </div>
  );
};

const SavingsView: React.FC<{ date: Date, data: Savings, onUpdate: (y: string, m: string, a: number) => void, onBack: () => void }> = ({ date, data, onUpdate, onBack }) => {
  const yearKey = format(date, 'yyyy');
  const yearSavings = data[yearKey] || {};
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const total = Object.values(yearSavings).reduce((acc, curr) => acc + (Number(curr) || 0), 0);
  return (
    <div className="flex flex-col h-full animate-slideIn pb-12">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack}><BackIcon size={24} /></button>
        <h2 className="text-xl font-light uppercase tracking-widest">Ahorros {yearKey}</h2>
      </div>
      <table className="w-full border-collapse border border-black text-sm">
        <thead>
          <tr className="bg-black text-white">
            <th className="border border-black p-2 font-light uppercase text-left">Mes</th>
            <th className="border border-black p-2 font-light uppercase text-right">Cantidad</th>
          </tr>
        </thead>
        <tbody>
          {months.map(m => (
            <tr key={m}>
              <td className="border border-black p-2 uppercase text-xs font-light">{m}</td>
              <td className="border border-black p-0">
                <input type="number" value={yearSavings[m] || ''} onChange={e => onUpdate(yearKey, m, parseFloat(e.target.value))} className="w-full p-2 bg-transparent text-right" placeholder="0.00" />
              </td>
            </tr>
          ))}
          <tr className="bg-gray-100 font-bold">
            <td className="border border-black p-2 uppercase text-xs">Total Anual</td>
            <td className="border border-black p-2 text-right">{total.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const HealthView: React.FC<{ date: Date, data: HealthData, onUpdate: (y: string, items: any[]) => void, onBack: () => void }> = ({ date, data, onUpdate, onBack }) => {
  const yearKey = format(date, 'yyyy');
  const items = data[yearKey] || [];
  const [newItemText, setNewItemText] = useState('');
  const handleAdd = () => {
    if (!newItemText) return;
    onUpdate(yearKey, [...items, { id: Date.now().toString(), title: newItemText, completed: false }]);
    setNewItemText('');
  };
  const handleToggle = (id: string) => onUpdate(yearKey, items.map(i => i.id === id ? { ...i, completed: !i.completed } : i));
  const handleDelete = (id: string) => onUpdate(yearKey, items.filter(i => i.id !== id));
  return (
    <div className="flex flex-col h-full animate-slideIn pb-12">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack}><BackIcon size={24} /></button>
        <h2 className="text-xl font-light uppercase tracking-widest">Salud {yearKey}</h2>
      </div>
      <div className="flex gap-2 mb-8">
        <input type="text" value={newItemText} onChange={e => setNewItemText(e.target.value)} placeholder="Añadir pendiente..." className="flex-1 border-b border-black py-2 text-sm font-light italic" onKeyDown={e => e.key === 'Enter' && handleAdd()} />
        <button onClick={handleAdd} className="border border-black p-2"><Plus size={20} /></button>
      </div>
      <div className="space-y-4">
        {items.map(item => (
          <div key={item.id} className="flex items-center justify-between border-b border-gray-100 py-2">
            <div className="flex items-center gap-3">
              <button onClick={() => handleToggle(item.id)} className={`w-6 h-6 border border-black flex items-center justify-center transition-all ${item.completed ? 'bg-black' : ''}`}>
                {item.completed && <X size={16} color="white" />}
              </button>
              <span className={`text-sm font-light ${item.completed ? 'line-through text-gray-400' : ''}`}>{item.title}</span>
            </div>
            <button onClick={() => handleDelete(item.id)} className="text-gray-300 hover:text-black"><Trash2 size={16} /></button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
