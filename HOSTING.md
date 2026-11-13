# Sekund — uputstvo za objavljivanje (hosting)

Sajt ima backend (Express server), pa mu treba Node hosting. Najjednostavniji
besplatni izbor je **Render** (render.com).

## Šta ti treba pre početka

1. Nalog na **github.com** (besplatno)
2. Nalog na **render.com** (besplatno, može prijava preko GitHub-a)

## Korak 1 — stavi kod na GitHub

U terminalu, u folderu `app`:

```bash
git init
git add .
git commit -m "Sekund prodavnica"
```

Zatim napravi novi repozitorijum na github.com (New repository → ime npr.
`sekund`) i poveži ga:

```bash
git remote add origin https://github.com/TVOJ-KORISNIK/sekund.git
git branch -M main
git push -u origin main
```

## Korak 2 — Render web servis

1. Na render.com klikni **New → Web Service**
2. Izaberi **Build and deploy from a Git repository** i poveži svoj GitHub nalog
3. Izaberi repozitorijum `sekund`
4. Podesi:
   - **Name:** `sekund` (dobićeš adresu `https://sekund.onrender.com`)
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
5. Pod **Environment Variables** dodaj:
   - `SEKUND_ADMIN_PASSWORD` = tvoja tajna admin lozinka (obavezno promeni!)
6. Klikni **Create Web Service** — za par minuta sajt je na vazduhu.

## Važna upozorenja (besplatni plan)

- **Disk je privremen:** na besplatnom planu se `data/` folder (artikli i
  porudžbine) resetuje pri svakom restartu objavljivanja. Za trajno čuvanje:
  - dodaj **Render Disk** (plaća se, ~$1/GB mesečno) i montiraj ga na
    putanju `data/`, ili
  - prebaci bazu na Supabase (besplatno) — javi mi pa uradimo prelaz.
- **Sajt „spava":** posle 15 minuta bez poseta Render uspavljuje besplatni
  servis; prva sledeća poseta čeka ~30 sekundi dok se probudi.
- **Admin lozinka:** više nije u kodu — postavlja se kroz
  `SEKUND_ADMIN_PASSWORD` promenljivu na Renderu.

## Lokalno pokretanje (kao i do sada)

```bash
npm run dev
```

i otvori `http://localhost:7100`.
