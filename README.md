# 🐍 Python Učilica

> Interaktivna desktop aplikacija za učenje osnova Pythona — za početnike, bez instalacije.

![License](https://img.shields.io/badge/license-MIT-blue)
![Platform](https://img.shields.io/badge/platform-Linux%20%7C%20Windows-lightgrey)

---

## ⬇ Preuzimanje

Idi na [**Releases**](../../releases/latest) i preuzmi:

| Platforma | Fajl |
|-----------|------|
| 🐧 Linux (sve distribucije) | `Python-Ucilica-x.x.x-x64.AppImage` |
| 🪟 Windows | `PythonUcilica-Setup.exe` |

### Linux — pokretanje AppImage
```bash
chmod +x Python-Ucilica-*.AppImage
./Python-Ucilica-*.AppImage
```

### Windows
Pokreni `PythonUcilica-Setup.exe` i slijedi upute.

---

## 🎯 Šta aplikacija nudi

- **27 interaktivnih vježbica** — popuni prazninu, ispravi grešku, napiši program
- **4 bloka:** print(), varijable, input(), if/elif/else
- **Python engine u aplikaciji** — radi potpuno offline, bez interneta
- **AI Asistent** — offline tutor koji odgovara na pitanja o Pythonu na bosanskom
- **Višestruki profili** — svaki član porodice ima vlastiti napredak
- **Top lista** — sistem bodova, natjecanje između učenika na istom računaru
- **Auto-update** — automatska provjera novih verzija

---

## 🛠 Za programere

### Pokretanje iz koda

```bash
git clone https://github.com/GITHUB_USERNAME/python-ucilica
cd python-ucilica
npm install
npm start
```

### Build

```bash
# Linux → AppImage
npm run make -- --platform=linux

# Windows → .exe instaler
npm run make -- --platform=win32
```

### Release (novi tag = automatski build)

```bash
# Povećaj verziju u package.json, pa:
git add package.json
git commit -m "v1.1.0"
git tag v1.1.0
git push && git push --tags
```

GitHub Actions automatski builda AppImage i .exe i kreira Draft Release.

### GitHub Token za publisher

U GitHub repo: **Settings → Secrets → Actions → New secret**
- Ime: `GITHUB_TOKEN` (već postoji automatski)

Za `electron-forge publish` komandu lokalno:
- Ime: `GITHUB_TOKEN`
- Vrijednost: Personal Access Token s `repo` permisijom

---

## 📁 Struktura projekta

```
python-ucilica/
├── .github/
│   └── workflows/
│       └── build.yml       ← Auto-build na svakom tagu
├── src/
│   ├── main.js             ← Electron main process + auto-updater
│   ├── preload.js          ← Sigurni IPC most
│   ├── index.html          ← Cijela aplikacija
│   └── pyodide/            ← Python engine (~14MB, offline)
├── assets/
│   └── icon.png            ← Ikona aplikacije (512×512)
└── package.json            ← Forge konfiguracija
```

---

## 📍 Gdje se čuva napredak

| Platforma | Lokacija |
|-----------|----------|
| Linux | `~/.config/python-ucilica/progress.json` |
| Windows | `%APPDATA%\python-ucilica\progress.json` |

---

## 📄 Licenca

MIT — slobodno koristi, modificiraj i distribuiraj.
