# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - img "UNLIM" [ref=e5]
      - heading "BENVENUTO IN ELAB TUTOR" [level=1] [ref=e6]
      - paragraph [ref=e7]: Simulatore di elettronica e Arduino per la scuola
      - generic [ref=e8]:
        - generic [ref=e9]: Chiave univoca
        - textbox "Chiave univoca" [active] [ref=e10]:
          - /placeholder: Inserisci la tua chiave...
        - button "ENTRA" [ref=e11] [cursor=pointer]
    - generic [ref=e12]: ELAB Tutor — Andrea Marro
  - dialog "Consenso privacy" [ref=e13]:
    - generic [ref=e15]:
      - paragraph [ref=e16]: Prima di iniziare, dicci quanti anni hai. Ci serve per proteggerti al meglio!
      - generic [ref=e17]:
        - generic [ref=e18]: Quanti anni hai?
        - combobox "Quanti anni hai?" [ref=e19] [cursor=pointer]:
          - option "Scegli..." [selected]
          - option "8 anni"
          - option "9 anni"
          - option "10 anni"
          - option "11 anni"
          - option "12 anni"
          - option "13 anni"
          - option "14 anni"
          - option "15 anni"
          - option "16 anni"
          - option "17 anni"
          - option "18+ anni"
        - button "Avanti" [disabled] [ref=e20] [cursor=pointer]
```