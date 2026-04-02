# Deploy frontend Sambil (sambil.publivalla.com)

Servidor **compartido** (mismo esquema que PortPax / rbcold): Nginx en `sites-available` + `sites-enabled`, código bajo `/home/git/…`.

## Estructura del código (`src/`)

El proyecto usa el directorio **`src/`**: rutas y layouts en **`src/app/`**, componentes en **`src/components/`**, utilidades en **`src/lib/`**, etc. Los alias de import `@/` apuntan a `src/` (ver `jsconfig.json`). El script de deploy no necesita rutas extra: `npm run build` ya toma `src/app` como raíz del App Router.

## Por qué no es `out/` estático

Esta app Next tiene rutas **dinámicas** (`/catalog/[id]`, `/dashboard/[[...section]]`, `/m/[code]`). No se puede usar `output: "export"` sin reescribir rutas. En producción se usa **`output: "standalone"`**: se sube el bundle mínimo y **Node** sirve la app en `127.0.0.1:3010`; **Nginx** hace **proxy_pass** HTTPS.

## Requisitos locales

- SSH: Host **`sambil-frontend`** en `~/.ssh/config` (usuario con `sudo`, p. ej. root).
- **`frontend/.env.production`**: debe incluir `NEXT_PUBLIC_API_URL=https://api.publivalla.com` (referencia y para `source` en el script).
- **Importante:** **`frontend/.env.local`** también se lee en `next build`. Si ahí tienes `NEXT_PUBLIC_API_URL=http://127.0.0.1:8000`, el bundle de producción podría quedar apuntando al backend local. **`deploy.sh` exporta `NEXT_PUBLIC_API_URL` antes del build** para forzar el valor de producción (o el de `.env.production` / fallback `https://api.publivalla.com`).

En el **servidor** no hace falta un `.env` para el frontend: la URL del API va **incrustada en el JavaScript** en el momento del build en tu máquina.

## Deploy habitual

Desde **`frontend/`**:

```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

Hace `npm run build`, arma el bundle (standalone + `.next/static` + `public`), **rsync** a `sambil-frontend:/home/git/sambil/` y reinicia **`sambil-frontend`** si el unit systemd existe.

Variable opcional: `SAMBIL_FRONTEND_SSH=otro-host` si el Host de SSH no es `sambil-frontend`.

## Setup una sola vez en el servidor compartido

Conectar: `ssh sambil-frontend`.

### 1. Node.js

Si no hay Node (o es muy viejo), instalar **Node 20+** (p. ej. NodeSource o `nvm` para el usuario `git`). El unit usa **`/usr/bin/node`**: ajustá `ExecStart` en `sambil-frontend.service` si el binario está en otro path.

### 2. Directorio

```bash
mkdir -p /home/git/sambil
chown -R git:git /home/git/sambil
chmod 755 /home/git /home/git/sambil
```

Asegurar **`/var/www/letsencrypt`** para ACME (como en otros sitios del mismo servidor).

### 3. Nginx — HTTP solo (certificado)

Copiar `scripts/nginx-sambil-http-only.conf` a `/etc/nginx/sites-available/sambil.publivalla.com.conf`, enlazar en `sites-enabled`, `nginx -t && systemctl reload nginx`.

### 4. Let's Encrypt

```bash
certbot certonly --webroot -w /var/www/letsencrypt -d sambil.publivalla.com --non-interactive --agree-tos --register-unsafely-without-email
```

(Ajustá flags si ya tenés cuenta certbot con email.)

### 5. Nginx — HTTPS + proxy

Sustituir el sitio por `scripts/nginx-sambil.publivalla.com.conf` (o fusionar con lo que deje certbot). `nginx -t && systemctl reload nginx`.

### 6. Systemd (Node en 3010)

```bash
cp /ruta/al/repo/frontend/scripts/sambil-frontend.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now sambil-frontend
```

El puerto **3010** debe ser libre; si choca con otro proyecto, cambiá `PORT` y `Environment=PORT` en el unit **y** `proxy_pass` en el conf de Nginx.

### 7. Primer deploy

Desde tu máquina, en `frontend/`: `./scripts/deploy.sh`.

---

## Estructura de referencia en el servidor

| Sitio (ejemplo)       | Rol              | Ruta / notas                          |
|-----------------------|------------------|----------------------------------------|
| itm.portpax.com       | estático `out/`  | `/home/git/itm/frontend/dist`         |
| sambil.publivalla.com | Next standalone  | `/home/git/sambil` + systemd + proxy |

No se tocan los `server_name` ni los roots de los otros proyectos; solo se añade **un** archivo en `sites-available` y **un** symlink en `sites-enabled`.
