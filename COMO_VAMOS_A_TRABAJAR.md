# 🤝 Guía de Colaboración del Equipo

Este documento define **cómo trabajaremos en equipo** para desarrollar el proyecto de forma organizada, evitando conflictos, pisadas de código y merges innecesarios.

---

## 🧱 Estructura de ramas

Utilizaremos un flujo de trabajo basado en ramas personales y una rama central de desarrollo:

```
main        → rama estable (versión final y probada)
dev         → rama de desarrollo (integración de todas las ramas)
lautaro-ui  → rama personal de Lautaro (interfaz / frontend)
juan-api    → rama personal de Juan (backend / API)
mati-auth   → rama personal de Mati (autenticación / login)
```

---

## 🚀 Configuración inicial

### 🔹 1. Clonar el repositorio (todos)
```bash
git clone https://github.com/<usuario>/mi-proyecto-web.git
cd mi-proyecto-web
```

### 🔹 2. Crear la rama `dev` (solo una persona, por ejemplo Lautaro)
```bash
git checkout -b dev
git push origin dev
```

Los demás pueden traerla con:
```bash
git fetch origin
git checkout dev
```

### 🔹 3. Crear ramas personales desde `dev`

**Agus:**
```bash
git checkout dev
git pull
git checkout -b agus-api
git push origin agus-api
```
**Ignacio:**
```bash
git checkout dev
git pull
git checkout -b ignacio-auth
git push origin ignacio-auth
```
**Lautaro:**

```bash
git checkout dev
git pull
git checkout -b lautaro-ui
git push origin lautaro-ui
```



---

## 🧩 Flujo de trabajo diario

Cada integrante trabajará **únicamente en su rama personal**.  
La rama `dev` será el punto de integración común.

### 🔸 1. Actualizar tu rama con los últimos cambios de `dev`
Antes de empezar a trabajar:
```bash
git checkout dev
git pull
git checkout <tu-rama>
git merge dev
```

### 🔸 2. Trabajar normalmente
Agregá tus cambios:
```bash
git add .
git commit -m "feat: agrego componente de navbar responsive"
git push
```

> 💡 Usá commits descriptivos (ver más abajo en la sección *Convenciones de commits*).

### 🔸 3. Subir tus avances a `dev`
Cuando completes una funcionalidad o tarea:
1. Subí tu rama al repositorio (`git push`).
2. Creá un **Pull Request (PR)** en GitHub:
   - Desde tu rama → hacia `dev`.
3. Otro miembro del equipo revisará el código antes del merge.

---

## 🔁 Mantener el entorno actualizado

Cada tanto (o cuando otro compañero haga un merge a `dev`):
```bash
git checkout dev
git pull
git checkout <tu-rama>
git merge dev
git push
```

Así todos mantienen su código sincronizado con el trabajo del resto.

---

## ✅ Integrar `dev` con `main` (solo cuando esté todo probado)

Cuando todo esté funcionando correctamente:
```bash
git checkout main
git pull
git merge dev
git push
```

De esta manera, `main` siempre refleja una versión **estable y lista para deploy**.

---

## ⚙️ Reglas y buenas prácticas

1. **No trabajar directamente en `main` ni en `dev`.**
2. **Hacer commits pequeños y frecuentes.**
3. **Actualizar tu rama desde `dev` antes de empezar cada jornada.**
4. **Revisar y aprobar PRs de los compañeros antes del merge.**
5. **Resolver conflictos solo en tu propia rama.**
6. **Usar mensajes de commit claros y consistentes.**

---

## 🧾 Convenciones de commits

Usaremos la convención **[Conventional Commits](https://www.conventionalcommits.org/es/v1.0.0/)**:

| Tipo | Uso |
|------|------|
| `feat:` | Nueva funcionalidad |
| `fix:` | Corrección de errores |
| `style:` | Cambios visuales o de formato |
| `refactor:` | Mejora del código sin cambiar funcionalidad |
| `docs:` | Actualización de documentación |
| `chore:` | Cambios menores o de mantenimiento |

**Ejemplo:**
```bash
git commit -m "feat: agrego componente de formulario de registro"
git commit -m "fix: corrijo error en validación de email"
```

---

## 🧠 Organización en GitHub( A considerar)

- Usaremos **Issues** para registrar tareas y bugs.  
- Usaremos **Projects** para gestionar el flujo de trabajo (To Do, In Progress, Done).  
- Activaremos **protección de ramas** (`main` y `dev`) para que solo se actualicen mediante PR aprobados.

---

## 📚 Recursos útiles

- [Flujo Git Flow (Atlassian)](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)
- [Guía de Pull Requests (GitHub Docs)](https://docs.github.com/es/pull-requests)
- [Convenciones de Commits](https://www.conventionalcommits.org/es/v1.0.0/)

---

✍️ **Equipo de desarrollo - TP Web**  
> Agustin • Ignacio • Lautaro
