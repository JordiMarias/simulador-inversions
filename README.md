# 📈 Simulador de Rendiments Reals d'Inversió
> **Real Returns Investment Simulator** — Backtesting realista i projeccions futures ajustades per inflació real i salaris històrics.

[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Chart.js](https://img.shields.io/badge/Chart.js-4.x-FF6384?logo=chartdotjs&logoColor=white)](https://www.chartjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-06B6D4.svg)](LICENSE)
[![Language: Catalan / English](https://img.shields.io/badge/Language-Catalan%20%7C%20English-10B981.svg)](#-suport-biling%C3%BCe)

---

## 🎯 Què fa aquest projecte?

El **Simulador de Rendiments Reals d'Inversió** és una aplicació web financera interactiva dissenyada per respondre a una pregunta fonamental:  
*«Què hauria passat realment si hagués començat a invertir el 10% del meu sou mensual fa 30 anys en lloc de deixar els diners al banc o sota el matalàs?»*

A diferència de les calculadores financeres convencionals d'interès compost (que solen utilitzar un percentatge teòric fix i un sou estàtic), aquest simulador aplica un **enfocament macroeconòmic realista**:

1. **Salaris històrics reals:** Cada any, l'aportació mensual s'adapta al salari medià del moment (sèries històriques reals de l'INE a Espanya o de la SSA als EUA).
2. **Ajust per inflació real:** Tots els valors es poden consultar en termes **nominals** o en **termes reals** (euros/dòlars constants del 2026), mesurant el veritable **poder de compra guanyat o perdut**.
3. **Múltiples actius i comparatives:** S&P 500, IBEX 35, Euro Stoxx 50, Immobiliari a Barcelona (amb hipoteca històrica), dipòsits bancaris i diners en efectiu al 0%.
4. **Projeccions estocàstiques de futur:** Motor de simulació **Monte Carlo** amb 1.000 iteracions per projectar trajectòries futures a partir del 2026.

---

## ✨ Característiques Principals

### 1. 🕰️ Mode Backtesting Històric (1928 – 2026)
- **Sèries temporals completes:** Més de 90 anys de dades d'evolució borsària, inflació i salaris.
- **Èpoques i presets preconfigurats:**
  - 🇪🇸 *L'Era de l'Euro i Moderna (1995–2025)*
  - 🇪🇸 *De Barcelona 92 a la Pandèmia (1990–2020)*
  - 🇪🇸 *La Bombolla Immobiliària (2000–2026)*
  - 🇺🇸 *Els 30 Anys Moderns (1995–2025)*
  - 🇺🇸 *La Gran Estagflació i el Boom dels 80 (1970–2000)*
  - 🇺🇸 *L'Edat d'Or de Postguerra (1950–1980)*
  - 🇺🇸 *Superant la Gran Depressió (1929–1959)*
- **Valoració Nominal vs. Real:** Multiplicadors deflactors basats en l'IPC/CPI històric.

### 2. 🎲 Mode Projecció de Futur (2026+) amb Monte Carlo
- Executa **1.000 simulacions estocàstiques** basades en el mostreig aleatori (*bootstrapping*) dels rendiments històrics del mercat.
- Càlcul de ventalls i percentils:
  - **P90 (Escenari Optimista / Bull)**
  - **P50 (Escenari Mediana / Esperat)**
  - **P10 (Escenari Pessimista / Bear)**
- Personalització de salari inicial, estalvi mensual, horitzó temporal, inflació esperada i creixement salarial real.
- Identificació automàtica de fites de patrimoni (€100k, €250k, €500k, €1M) i probabilitat d'èxit.

### 3. 🏢 Cas Pràctic Immobiliari: Barcelona (75 m² + Hipoteca)
- Simula la compra d'un habitatge de 75 m² a preu real de l'any d'inici.
- Aplica una hipoteca històrica al 80% amb tipus reals d'època (Míbor / Euríbor + diferencial).
- Amortització any a any, cobrament de rendiment per lloguer net (~4,2%) i càlcul del patrimoni net (*Home Equity + rendes acumulades*).

### 4. 🚨 Alerta de Destrucció de Poder Adquisitiu (Efectiu)
- Quantifica en temps real la pèrdua acumulada per inflació de tenir diners estancats al 0% d'interès respecte a qualsevol estratègia indexada.

### 5. 📑 Desglossament Any per Any i Exportació
- Taula interactiva amb totes les mètriques anuals: salari, aportació anual, revaloritzacions, inflació i valor de cada cartera.
- **Exportació directa a fitxer CSV** per anàlisi avançat a Excel, Google Sheets o Python.

### 6. 🌐 Suport Bilingüe
- Commutador instantani entre **Català** i **English**.

---

## 🗂️ Estructura del Codi

```
simulador-inversions/
├── index.html              # Estructura semàntica de l'aplicació i contenidors
├── package.json            # Metadades del projecte, dependències i scripts
├── .gitignore              # Fitxers exclosos del control de versions
├── LICENSE                 # Llicència de codi obert MIT
├── README.md               # Documentació del projecte
└── src/
    ├── main.js             # Orquestrador central, estat de l'aplicació i listeners
    ├── style.css           # Sistema de disseny complet (Dark Glassmorphism, CSS variables)
    ├── data/
    │   └── historicalData.js   # Sèries de dades històriques (1928-2026, Damodaran, INE, etc.)
    ├── engine/
    │   ├── simulationEngine.js # Algorismes de backtesting, càlcul d'hipoteques i deflació
    │   └── monteCarloEngine.js # Motor probabilístic Monte Carlo i càlcul de percentils
    └── ui/
        ├── chartManager.js     # Renderització i actualització de gràfics amb Chart.js
        └── i18n.js             # Sistema i diccionaris de traducció (Català / English)
```

---

## 📚 Fonts de Dades Verificades

Totes les sèries històriques incorporades a l'aplicació provenen de fonts oficials i de referència acadèmica:
- **S&P 500 Total Return (amb dividends):** Prof. Aswath Damodaran (*NYU Stern School of Business*) & Prof. Robert Shiller (*Yale University*).
- **Inflació dels EUA (CPI-U):** *US Bureau of Labor Statistics* (BLS).
- **Salaris Històrics EUA:** *US Social Security Administration* (SSA) & *US Census Bureau*.
- **Inflació d'Espanya (IPC):** *Instituto Nacional de Estadística* (INE).
- **Salaris Històrics Espanya:** INE (*Encuesta de Estructura Salarial*) i sèries històriques pesseta/euro.
- **IBEX 35 Total Return:** *Bolsas y Mercados Españoles* (BME) / IGBM.
- **Euro Stoxx 50 Total Return:** *STOXX Ltd.*
- **Preu de l'habitatge a Barcelona (€/m²):** *Ministerio de Vivienda y Agenda Urbana*, INE i sèries històriques Fotocasa/Idealista.
- **Tipus hipotecaris i dipòsits a Espanya:** *Banco de España* (Míbor, Euríbor a 12 mesos i sèries de dipòsits a termini).

---

## 🛠️ Tecnologies Utilitzades

- **Frontend Core:** HTML5 semàntic, Vanilla JavaScript (ES Modules).
- **Estils:** Modern CSS3 (Dark Theme, Glassmorphism, Flexbox, CSS Grid, animacions suaus).
- **Gràfics:** [Chart.js](https://www.chartjs.org/) v4.x.
- **Iconografia:** [Lucide Icons](https://lucide.dev/).
- **Bundler / Dev Server:** [Vite](https://vitejs.dev/) v5.x.

---

## 🚀 Instal·lació i Execució Local

Assegura't de tenir instal·lat [Node.js](https://nodejs.org/) (versió 18 o superior recomanada).

### 1. Clonar el repositori
```bash
git clone https://github.com/JordiMarias/simulador-inversions.git
cd simulador-inversions
```

### 2. Instal·lar dependències
```bash
npm install
```

### 3. Iniciar el servidor de desenvolupament
```bash
npm run dev
```
Obre el navegador a la URL indicada (per defecte `http://localhost:5173`).

### 4. Compilar per a producció
```bash
npm run build
```
Els fitxers optimitzats es generaran al directori `dist/`.

### 5. Previsualitzar el paquet de producció
```bash
npm run preview
```

---

## 📄 Llicència

Aquest projecte es distribueix sota la llicència **MIT**. Consulta el fitxer [LICENSE](LICENSE) per a més detalls.
