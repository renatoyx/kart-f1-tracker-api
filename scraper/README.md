# Kart history scraper

Scraper em Python para coletar o histórico de kart dos pilotos.

## Requisitos

- Python 3.12 ou superior
- Google Chrome, Microsoft Edge ou Firefox instalado

O Selenium Manager resolve o WebDriver compatível automaticamente na primeira
execução. Não é necessário baixar o ChromeDriver manualmente.

## Instalação

```powershell
cd scraper
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

## Execução

```powershell
python main.py
```

Sem argumentos, o scraper usa Max Verstappen como piloto de desenvolvimento.
Para outro piloto:

```powershell
python main.py "Lewis Hamilton" `
  "https://en.wikipedia.org/wiki/Lewis_Hamilton" `
  --nationality "British"
```

O backend deve ter sido iniciado pelo menos uma vez para criar as tabelas em
`data/kart-f1-tracker.db`.
