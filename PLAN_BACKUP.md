# Plan de Implementación: Exportación/Importación de Datos

## Análisis del Estado Actual

### Estructura de Datos (`AppState`)
Los datos se almacenan en `localStorage` bajo la clave `notebk_data` como JSON:

```typescript
interface AppState {
  expenses: MonthlyExpenses;    // Gastos/ingresos mensuales (clave: yyyy-MM)
  savings: Savings;             // Ahorros por año/mes (clave: año → mes español)
  notes: NoteData;              // Notas diarias (clave: yyyy-MM-dd)
  monthlyNotes: NoteData;       // Notas mensuales (clave: yyyy-MM)
  health: HealthData;           // Metas de salud por año (clave: año)
  customTables: AnnualCustomTables; // Tablas personalizadas por año
}
```

### Archivos Relevantes
- `utils/storage.ts` - Funciones `loadData()` y `saveData()` para localStorage
- `types.ts` - Definiciones de tipos de datos
- `App.tsx` - Componente principal donde se gestionan los estados

---

## Opciones de Implementación

### Opción A: Share API + File Input (Recomendada)
**Pros:** Funciona en web y Android, no requiere permisos especiales, UX familiar
**Contras:** Depende del sistema de compartir del dispositivo

### Opción B: Capacitor Filesystem
**Pros:** Control total sobre dónde se guarda el archivo
**Contras:** Requiere permisos de almacenamiento en Android, más complejo

### Opción C: Capacitor Share + Filesystem combinado
**Pros:** Mejor de ambos mundos
**Contras:** Más código y dependencias

**Decisión: Opción A** - Es la más simple y funciona bien para el caso de uso.

---

## Plan de Implementación

### Fase 1: Preparación

#### 1.1 Instalar dependencia (si se necesita para compartir archivos)
```bash
npm install @capacitor/share
npx cap sync
```

#### 1.2 Crear funciones de utilidad en `utils/backup.ts`

```typescript
// utils/backup.ts
import { AppState } from '../types';
import { loadData } from './storage';

const BACKUP_VERSION = 1;

interface BackupData {
  version: number;
  timestamp: string;
  appName: string;
  data: AppState;
}

// Crear objeto de backup con metadatos
export const createBackup = (): BackupData => {
  return {
    version: BACKUP_VERSION,
    timestamp: new Date().toISOString(),
    appName: 'notebk',
    data: loadData()
  };
};

// Validar que el backup sea válido
export const validateBackup = (backup: any): backup is BackupData => {
  return (
    backup &&
    typeof backup === 'object' &&
    backup.appName === 'notebk' &&
    typeof backup.version === 'number' &&
    backup.data &&
    typeof backup.data === 'object'
  );
};

// Generar nombre de archivo con fecha
export const generateBackupFilename = (): string => {
  const date = new Date().toISOString().split('T')[0];
  return `notebk-backup-${date}.json`;
};
```

---

### Fase 2: Implementar Exportación

#### 2.1 Función de exportación (compartir/descargar)

```typescript
// En utils/backup.ts
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

export const exportBackup = async (): Promise<boolean> => {
  try {
    const backup = createBackup();
    const jsonString = JSON.stringify(backup, null, 2);
    const filename = generateBackupFilename();

    if (Capacitor.isNativePlatform()) {
      // En Android: usar Share API con archivo
      const blob = new Blob([jsonString], { type: 'application/json' });
      const file = new File([blob], filename, { type: 'application/json' });

      // Crear URL temporal para compartir
      const url = URL.createObjectURL(file);

      await Share.share({
        title: 'Backup de notebk',
        text: 'Archivo de respaldo de notebk',
        url: url,
        dialogTitle: 'Guardar backup'
      });

      URL.revokeObjectURL(url);
    } else {
      // En Web: descargar directamente
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    return true;
  } catch (error) {
    console.error('Error al exportar backup:', error);
    return false;
  }
};
```

---

### Fase 3: Implementar Importación

#### 3.1 Función de importación (leer archivo)

```typescript
// En utils/backup.ts
import { saveData } from './storage';

export const importBackup = (file: File): Promise<{ success: boolean; error?: string }> => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const backup = JSON.parse(content);

        if (!validateBackup(backup)) {
          resolve({ success: false, error: 'Archivo de backup inválido' });
          return;
        }

        // Guardar los datos importados
        saveData(backup.data);
        resolve({ success: true });
      } catch (error) {
        resolve({ success: false, error: 'Error al leer el archivo' });
      }
    };

    reader.onerror = () => {
      resolve({ success: false, error: 'Error al leer el archivo' });
    };

    reader.readAsText(file);
  });
};
```

---

### Fase 4: Crear UI de Configuración

#### 4.1 Nueva vista `SettingsView` en App.tsx

Agregar nueva vista de configuración accesible desde el calendario:

```typescript
const SettingsView: React.FC<{
  onBack: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  isExporting: boolean;
}> = ({ onBack, onExport, onImport, isExporting }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
    }
  };

  return (
    <div className="flex flex-col h-full animate-slideIn">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack}><BackIcon size={24} /></button>
        <h2 className="text-xl font-light uppercase tracking-widest">Configuración</h2>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium uppercase tracking-widest opacity-60">
          Respaldo de datos
        </h3>

        <button
          onClick={onExport}
          disabled={isExporting}
          className="w-full border border-black py-4 text-sm font-medium hover:bg-black hover:text-white transition-all uppercase tracking-widest disabled:opacity-50"
        >
          {isExporting ? 'Exportando...' : 'Exportar datos'}
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full border border-black py-4 text-sm font-medium hover:bg-black hover:text-white transition-all uppercase tracking-widest"
        >
          Importar datos
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileSelect}
          className="hidden"
        />

        <p className="text-xs text-gray-500 mt-4">
          Exporta tus datos para crear un respaldo. Importa un archivo de respaldo
          para restaurar tus datos (esto reemplazará los datos actuales).
        </p>
      </div>
    </div>
  );
};
```

#### 4.2 Agregar botón de configuración en el calendario

En la vista del calendario, agregar un botón para acceder a configuración:

```typescript
// En la vista calendar, agregar botón de settings
<button
  onClick={() => setCurrentView('settings')}
  className="absolute top-0 right-0 p-2 opacity-40 hover:opacity-100"
>
  <Settings size={20} />
</button>
```

#### 4.3 Actualizar tipos

En `types.ts`, agregar 'settings' al ViewState:

```typescript
export type ViewState = 'calendar' | 'expenses' | 'diary' | 'savings' |
  'health' | 'custom' | 'summary' | 'monthlyNotes' | 'customTableDetail' | 'settings';
```

---

### Fase 5: Integrar en App.tsx

#### 5.1 Agregar estados y handlers

```typescript
// En App component
const [isExporting, setIsExporting] = useState(false);

const handleExport = async () => {
  setIsExporting(true);
  const success = await exportBackup();
  setIsExporting(false);
  if (success) {
    // Opcional: mostrar mensaje de éxito
  }
};

const handleImport = async (file: File) => {
  const result = await importBackup(file);
  if (result.success) {
    // Recargar datos después de importar
    setData(loadData());
    setCurrentView('calendar');
    // Opcional: mostrar mensaje de éxito
  } else {
    // Mostrar error
    alert(result.error);
  }
};
```

#### 5.2 Agregar caso en renderView

```typescript
case 'settings':
  return (
    <SettingsView
      onBack={() => setCurrentView('calendar')}
      onExport={handleExport}
      onImport={handleImport}
      isExporting={isExporting}
    />
  );
```

#### 5.3 Actualizar manejo de back button

```typescript
case 'settings':
  setCurrentView('calendar');
  break;
```

---

## Resumen de Archivos a Crear/Modificar

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `utils/backup.ts` | Crear | Funciones de export/import |
| `types.ts` | Modificar | Agregar 'settings' a ViewState |
| `App.tsx` | Modificar | Agregar SettingsView, estados y handlers |

## Dependencias a Instalar

```bash
npm install @capacitor/share
npx cap sync
```

---

## Consideraciones de Seguridad

1. **Validación de backup**: Siempre validar estructura antes de importar
2. **Confirmación de usuario**: Confirmar antes de sobrescribir datos existentes
3. **Versión de backup**: Incluir versión para manejar migraciones futuras

---

## Mejoras Futuras (Opcional)

1. **Backup automático**: Guardar backup periódicamente en almacenamiento local
2. **Sincronización en la nube**: Integrar con Google Drive o similar
3. **Exportar parcial**: Permitir exportar solo ciertos datos (ej. solo gastos)
4. **Merge de datos**: En lugar de reemplazar, permitir combinar backups
5. **Cifrado**: Encriptar el backup con contraseña del usuario
