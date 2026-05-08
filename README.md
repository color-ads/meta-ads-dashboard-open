# Meta Ads Dashboard

Tablero de control de Meta Ads. Solo lectura. Conecta con tu Access Token y Ad Account ID.

## Deploy en Vercel (3 pasos)

```bash
# 1. Sube a GitHub
git init
git add .
git commit -m "Meta Ads Dashboard"
git remote add origin https://github.com/TU_USUARIO/meta-ads-dashboard.git
git push -u origin main

# 2. Ve a vercel.com → New Project → importa el repo

# 3. Dale el link a tu cliente ✓
```

## Qué incluye

- Campañas — estado, objetivo, fecha
- Insights — impresiones, clics, CTR, gasto, alcance (últimos 30 días)
- Catálogos — nombre, ID, conteo de productos
- Píxeles — estado, última activación

## Límites de API respetados

- Throttle de 300ms entre llamadas
- Lectura de headers `x-app-usage` y `x-ad-account-usage`
- Pausa automática si uso supera 75%
- Stop automático si supera 92%
