import React from 'react';
import { WrenchIcon, CircuitIcon } from '../../common/ElabIcons';
import styles from './ScratchErrorOverlay.module.css';

const ERROR_TRANSLATIONS = [
  {
    pattern: /'pin\d+' was not declared|undefined.*pin/i,
    title: 'Pin non dichiarato',
    body: 'Ragazzi, avete usato un pin che Arduino non conosce ancora. Controllate che il numero del pin sia corretto (es: 13 per LED interno).',
    breadboardHint: true,
  },
  {
    pattern: /expected.*before.*token|syntax error/i,
    title: 'Errore di sintassi',
    body: 'Ragazzi, i blocchi non sono incastrati correttamente. Controllate che ogni blocco sia agganciato a quello precedente.',
    breadboardHint: false,
  },
  {
    pattern: /not declared in this scope/i,
    title: 'Variabile sconosciuta',
    body: 'Ragazzi, state usando una variabile che non avete ancora creato. Andate nella categoria Variabili e create la variabile prima di usarla.',
    breadboardHint: false,
  },
  {
    pattern: /digitalWrite.*requires|invalid.*pin/i,
    title: 'Comando LED incompleto',
    body: 'Ragazzi, manca un parametro al blocco accendi LED. Trascinate dentro il blocco anche il numero del pin e lo stato (HIGH o LOW).',
    breadboardHint: true,
  },
];

const DEFAULT_TRANSLATION = {
  title: 'Errore durante la compilazione',
  body: 'Ragazzi, c\'è stato un problema. Controllate i blocchi e provate di nuovo. Se serve chiamate l\'insegnante.',
  breadboardHint: false,
};

function translateError(rawError) {
  if (!rawError) return null;
  for (const t of ERROR_TRANSLATIONS) {
    if (t.pattern.test(rawError)) return t;
  }
  return DEFAULT_TRANSLATION;
}

export default function ScratchErrorOverlay({ error, onDismiss }) {
  if (!error) return null;
  const translation = translateError(error);
  if (!translation) return null;

  return (
    <div className={styles.overlay} role="alert" aria-live="assertive">
      <div className={styles.card}>
        <div className={styles.iconWrap}>
          <WrenchIcon size={48} color="#E54B3D" />
        </div>
        <h3 className={styles.title}>{translation.title}</h3>
        <p className={styles.body}>{translation.body}</p>
        {translation.breadboardHint && (
          <div className={styles.hint}>
            <CircuitIcon size={32} />
            <span>Verificate anche il circuito sulla breadboard del kit ELAB.</span>
          </div>
        )}
        <details className={styles.rawError}>
          <summary>Dettaglio tecnico (per il docente)</summary>
          <pre>{error}</pre>
        </details>
        <button
          type="button"
          className={styles.button}
          onClick={onDismiss}
          aria-label="Chiudi messaggio errore"
        >
          Chiudi
        </button>
      </div>
    </div>
  );
}
