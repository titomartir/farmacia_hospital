# 📋 MANUAL PASO A PASO PARA REALIZAR COMMITS CON GIT

## Comandos básicos en orden:

### 1. VERIFICAR QUÉ CAMBIÓ
```powershell
git status
```
**¿Qué hace?** Muestra el estado actual del repositorio: archivos modificados, nuevos y eliminados.

---

### 2. VER CAMBIOS ESPECÍFICOS (Opcional)
```powershell
git diff nombre_del_archivo.js
```
**¿Qué hace?** Muestra las diferencias línea por línea de un archivo específico.
- Las líneas con `-` (rojas) fueron eliminadas
- Las líneas con `+` (verdes) fueron agregadas

---

### 3. AGREGAR ARCHIVOS AL STAGING

#### Opción A: Agregar archivos específicos
```powershell
git add archivo1.js archivo2.js archivo3.jsx
```

#### Opción B: Agregar TODOS los archivos modificados
```powershell
git add .
```

#### Opción C: Agregar todos los archivos de una carpeta
```powershell
git add backend/src/controllers/
```

**¿Qué hace?** Prepara los archivos para el commit, moviéndolos al "staging area" (área de preparación).

---

### 4. VERIFICAR QUE ESTÁN EN STAGING
```powershell
git status
```
**¿Qué verificar?** Debe mostrar "Changes to be committed:" con los archivos listos.

---

### 5. CREAR EL COMMIT
```powershell
git commit -m "tipo: Descripción corta del cambio

- Detalle 1 del cambio
- Detalle 2 del cambio
- Detalle 3 del cambio"
```

**¿Qué hace?** Crea un punto de guardado (commit) con todos los cambios que están en staging.

**Ejemplo:**
```powershell
git commit -m "feat: Agregar funcionalidad de entrega en consolidados

- Crear endpoint POST /api/consolidados/:id/entregar
- Implementar EntregarConsolidadoDialog en frontend
- Actualizar consolidadoService con método entregarConsolidado"
```

---

### 6. VERIFICAR QUE SE CREÓ EL COMMIT
```powershell
git log --oneline -5
```
**¿Qué hace?** Muestra los últimos 5 commits en formato compacto.

---

### 7. SUBIR CAMBIOS AL REPOSITORIO REMOTO (GitHub)
```powershell
git push origin main
```
**¿Qué hace?** Sube los commits locales al repositorio remoto en GitHub.

---

## 🎯 Prefijos recomendados para mensajes de commit

| Prefijo | Uso | Ejemplo |
|---------|-----|---------|
| `feat:` | Nueva funcionalidad | `feat: Agregar módulo de reportes` |
| `fix:` | Corrección de bug | `fix: Corregir cálculo de stock` |
| `refactor:` | Cambio en código sin modificar funcionalidad | `refactor: Optimizar consultas SQL` |
| `style:` | Cambios de formato | `style: Aplicar formato a código` |
| `docs:` | Cambios en documentación | `docs: Actualizar README` |
| `test:` | Agregar o modificar tests | `test: Agregar tests unitarios` |
| `chore:` | Tareas de mantenimiento | `chore: Actualizar dependencias` |

---

## 💡 Consejos importantes

1. **Commits pequeños y frecuentes**: Mejor hacer varios commits pequeños que uno gigante
2. **Mensajes descriptivos**: Explica QUÉ hiciste y POR QUÉ
3. **Revisa antes de commitear**: Usa `git status` y `git diff` para verificar
4. **No subas archivos temporales**: Evita agregar archivos como `nul`, `node_modules`, `.env`, etc.
5. **Haz commit antes de cambiar de rama**: Asegura que tu trabajo esté guardado

---

## 🔄 Comandos útiles adicionales

### Deshacer cambios en un archivo (antes de add)
```powershell
git restore nombre_archivo.js
```

### Quitar archivo del staging (después de add, antes de commit)
```powershell
git restore --staged nombre_archivo.js
```

### Ver historial completo
```powershell
git log
```

### Ver historial con gráfico
```powershell
git log --graph --oneline --all
```

### Ver cambios de todos los archivos
```powershell
git diff
```

### Ver quién modificó cada línea de un archivo
```powershell
git blame nombre_archivo.js
```

### Ver cambios de un commit específico
```powershell
git show <hash_del_commit>
```

### Crear una nueva rama
```powershell
git checkout -b nombre-nueva-rama
```

### Cambiar de rama
```powershell
git checkout nombre-rama
```

### Ver todas las ramas
```powershell
git branch -a
```

---

## 📝 Flujo completo de trabajo (ejemplo práctico)

```powershell
# 1. Ver qué cambió
git status

# 2. Revisar cambios específicos (opcional)
git diff backend/src/controllers/consolidadoController.js

# 3. Agregar archivos al staging
git add backend/src/controllers/consolidadoController.js
git add frontend/src/pages/Consolidados.jsx
# O agregar todo: git add .

# 4. Verificar staging
git status

# 5. Crear commit
git commit -m "feat: Implementar entrega de consolidados

- Agregar función entregarConsolidado en backend
- Crear componente EntregarConsolidadoDialog
- Actualizar página Consolidados con botón de entrega"

# 6. Verificar commit
git log --oneline -3

# 7. Subir a GitHub
git push origin main
```

---

## ⚠️ Errores comunes y soluciones

### Error: "nothing added to commit"
**Solución:** Olvidaste hacer `git add`. Agrega los archivos primero.

### Error: "Your branch is ahead of 'origin/main'"
**Solución:** Tienes commits locales que no has subido. Usa `git push origin main`.

### Error: "Please tell me who you are"
**Solución:** Configura tu usuario:
```powershell
git config --global user.email "tu@email.com"
git config --global user.name "Tu Nombre"
```

### Quiero deshacer el último commit (sin perder cambios)
```powershell
git reset --soft HEAD~1
```

### Quiero deshacer el último commit (perdiendo cambios)
```powershell
git reset --hard HEAD~1
```

---

## 🚀 Atajos útiles

### Ver estado resumido
```powershell
git status -s
```

### Agregar y commitear en un solo paso (solo archivos ya trackeados)
```powershell
git commit -am "mensaje del commit"
```

### Ver diferencias de archivos en staging
```powershell
git diff --staged
```

### Ignorar archivos temporales
Crear archivo `.gitignore` en la raíz del proyecto:
```
node_modules/
.env
*.log
nul
dist/
build/
.vscode/
```

---

## 📚 Recursos adicionales

- [Documentación oficial de Git](https://git-scm.com/doc)
- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)
- [Convenciones de commits](https://www.conventionalcommits.org/)

---

**Última actualización:** Noviembre 2025
