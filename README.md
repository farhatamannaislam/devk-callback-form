# DEVK Callback Form

Ein schlankes, mehrstufiges Web-Formular, mit dem Interessenten einen **Rückrufdurch die DEVK** anfordern können.
Das Projekt ist **statisch** (HTML/CSS/JS) und sendet die Daten per fetch an ein Backend-API.

## Live-Demo
* **GitHub Pages:** https://farhatamannaislam.github.io/devk-callback-form/
* **Backend (Render):** https://devk-callback-form.onrender.com

Das Frontend wählt das API automatisch: auf ```*.github.io``` → **PROD**, lokal → **LOCAL**.

## Features

* **3 Tabs / 4 Abschnitte** mit Fortschrittsanzeige
  * Tab 1: Kunde & Persönliche Daten (Abschnitte 1–2)
  * Tab 2: Kontakt & Interessen (Abschnitt 3)
  * Tab 3: Übersicht (Abschnitt 4)

* **Dynamischer Flow**
  * Wenn Kunde = Ja: Überspringen der persönlichen Daten.

* **Validierung im Browser**
  * E-Mail: einfaches Regex
  * PLZ: genau 5 Ziffern
  * Interessen: mind. eine Auswahl
  * Datenschutz: Checkbox muss angehakt sein
  * Kundennummer: Pflichtfeld, wenn Kunde = Ja (mind. nicht leer)

* **Zusammenfassung (Übersicht)** vor dem Absenden
* **Theming über CSS-Variablen** (DEVK-Look & Feel)
* **(DEVK-Look & Feel)** Nutzerhinweisen

## Tech-Stack
* **Frontend:** HTML5, CSS3, Vanilla JavaScript
* **Hosting:** GitHub Pages (Frontend), Render (Backend)
* **API:** POST /api/callback (JSON)

## Projektstruktur

```Bash
devk-callback-form/
├─ index.html       # Markup (Tabs/Abschnitte)
├─ style.css        # DEVK Theme (Variablen, Komponenten)
└─ app.js           # Logik, Validierung, API-Calls, Progress-Mapping
```

### Lokale Entwicklung

Da es sich um statische Dateien handelt, genügt ein lokaler Webserver.

### Option A – Python

```bash
python3 -m http.server 3000
# öffne: http://localhost:3000
```

### Option B – Node

```bash
npx serve -l 3000
# öffne: http://localhost:3000
```

## API

### Endpoint

```bash
POST {API_BASE}/api/callback
Content-Type: application/json
```

### Beispiel-Payload

```json
{
  "isCustomer": "no",
  "customerNumber": "",
  "firstName": "Anna",
  "lastName": "Muster",
  "zipCode": "50667",
  "city": "Köln",
  "profession": "Ingenieurin",
  "employer": "ACME GmbH",
  "email": "anna@example.com",
  "contactTime": "morning",
  "insuranceInterests": ["haftpflicht", "hausrat"],
  "comments": "Bitte vormittags anrufen.",
  "privacy": true
}
```
### Beispiel-Antwort

```json
{
  "success": true,
  "file": "callback-2025-09-15T10-39-15-888Z.html"
}
```

Bei Erfolg blendet das Frontend eine Bestätigung ein und lädt nach kurzer Zeit neu.

## Validierungsregeln (Frontend)
* **Kunde (isCustomer):** Pflichtfeld ```(yes/no)````
* **Kundennummer:** Pflicht, wenn ```isCustomer === "yes"``` (mind. nicht leer)
* **Vorname, Nachname, PLZ, Wohnort:** Pflicht, wenn ```isCustomer === "no"````
    * **PLZ:** ```^\d{5}$```
* **E-Mail:** ```^[^\s@]+@[^\s@]+\.[^\s@]+$```
* **Kontaktzeit (contactTime):** Pflicht (Dropdown)
* **Interessen (insuranceInterests):** mind. 1 Auswahl
* **Datenschutz (privacy):** Pflicht-Checkbox

## Styling & Theme

Alle zentralen Farben/Formen sind in ```:root``` definiert (siehe ```style.css```).
Wichtige Variablen:
```
--devk-green, --devk-green-dark, --devk-green-verylight
--devk-text, --devk-muted, --devk-border
--radius, --shadow, --shadow-sm
```

### Fortschrittsanzeige (Tabs)

Es ist immer **nur der aktuelle Tab grün.**
Mapping (in ```app.js```):
* Abschnitte 0–1 → Tab 0
* Abschnitt 2 → Tab 1
* Abschnitt 3 → Tab 2

## Build & Deploy

### GitHub Pages
* Repository pushen
* In den Repo-Einstellungen Pages aktivieren (Branch ```main/gh-pages```, Ordner ```/```).
* URL prüfen (siehe „Live-Demo“).

### Backend

* Wird aktuell über **Render** bereitgestellt (```PROD_URL``` in ```app.js```).
* Stelle sicher, dass **CORS** korrekt konfiguriert ist, wenn die Domain wechselt.

## Tests (manuell)

1. **Kunde = Ja**
* Kundennummer leer lassen → Fehler
* Abschnitt 2 wird übersprungen, Tab 2 korrekt aktiv

2. **Kunde = Nein**
* Leeres Pflichtfeld → Fehler unter dem jeweiligen Feld
* PLZ ≠ 5 Ziffern → Fehler

3. **Kontakt & Interessen**
* Ungültige E-Mail → Fehler
* Keine Interessen → Fehler
* Datenschutz nicht angehakt → Fehler

4. **Übersicht**
* Prüfen, ob Zusammenfassung alle Angaben korrekt aufführt

5. **Absenden**
* Erfolgsnachricht erscheint
* Fehlerfall: Meldung „Serverfehler – Backend erreichbar …?“

## Barrierefreiheit

* Deutliche Focus-Ringe für interaktive Elemente
* Labels & Fehlermeldungen sind an die Felder gebunden
* Tastaturnavigation (Tab-Reihenfolge) sichergestellt
* Reduzierte Animationen respektieren ```prefers-reduced-motion````

## Häufige Probleme
* **Alles grün / mehrere Tabs aktiv:**
Prüfe das Section→Tab-Mapping in ```showSection()``` (nur aktueller Tab ```.active```).
* **„Serverfehler – Backend erreichbar?“**
Prüfe, ob {```API_BASE```} korrekt ist und das Backend unter der URL erreichbar ist.
* **CORS-Fehler:**
Domain des Frontends im Backend freigeben.

## Validierung & Code-Qualität

- **HTML:** mit dem [W3C Markup Validation Service](https://validator.w3.org/) geprüft – **0 Fehler**  
- **CSS:** mit dem [W3C CSS Validator](https://jigsaw.w3.org/css-validator/) geprüft – **0 Fehler**  
  > Hinweise zu `var(--…)` (CSS Custom Properties) sind Informationsmeldungen und **keine** Fehler.
- **JavaScript:** mit [JSHint](https://jshint.com/) geprüft – **0 Fehler**  
  - Browser-Code (`app.js`):  
    ```js
    /* jshint browser:true, esversion:11, undef:true, unused:true */
    ```
  - Node-Code (`server.js`):  
    ```js
    /* jshint node:true, esversion:11 */
    ```

**Reproduktion:** Code in die jeweiligen Online-Validatoren einfügen (siehe Links oben).

