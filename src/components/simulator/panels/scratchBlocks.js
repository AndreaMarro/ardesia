import * as Blockly from 'blockly';

// ─── ELAB Block Styles ─────────────────────────────────────
// Mapped to ELAB_THEME.blockStyles in ScratchEditor.jsx
// Using setStyle() so the theme controls all colours centrally.
const STYLES = {
    BASE: 'arduino_io',        // Setup/Loop wrapper — same teal as I/O
    IO: 'arduino_io',          // Digital/Analog Read/Write
    TIME: 'arduino_time',      // Delay, Millis
    SERIAL: 'arduino_serial',  // Serial print
    SOUND: 'arduino_sound',    // Tone / Buzzer
    SERVO: 'arduino_servo',    // Servo motor
    LCD: 'arduino_lcd',        // Display LCD
    VARS: 'variable_blocks',   // Variables
    MATH_EXT: 'math_blocks',   // Map, constrain
};

// 1. Blocco base Arduino (Setup e Loop combinati) — Hat block (startHats: true)
Blockly.Blocks['arduino_base'] = {
    init: function () {
        this.appendDummyInput().appendField("Quando Arduino si accende");
        this.appendStatementInput("SETUP").setCheck(null).appendField("  Prepara (Setup)");
        this.appendDummyInput().appendField("Ripeti per sempre");
        this.appendStatementInput("LOOP").setCheck(null).appendField("  Ciclo (Loop)");
        this.setStyle(STYLES.BASE);
        this.setTooltip("Il cuore del programma! La Preparazione si fa una volta sola, il Ciclo si ripete all'infinito.");
        this.setHelpUrl("https://www.arduino.cc/reference/en/");
        this.setDeletable(false);
    }
};

// 2. pinMode
Blockly.Blocks['arduino_pin_mode'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("imposta pin")
            .appendField(new Blockly.FieldNumber(13, 0, 19), "PIN")
            .appendField("come")
            .appendField(new Blockly.FieldDropdown([
                ["USCITA", "OUTPUT"],
                ["INGRESSO", "INPUT"],
                ["INGRESSO PULLUP", "INPUT_PULLUP"]
            ]), "MODE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle(STYLES.IO);
        this.setTooltip("Dice ad Arduino se un pin manda segnali (USCITA) o li riceve (INGRESSO). Come scegliere se una strada e a senso unico!");
    }
};

// 3. digitalWrite
Blockly.Blocks['arduino_digital_write'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("scrivi pin")
            .appendField(new Blockly.FieldNumber(13, 0, 19), "PIN")
            .appendField("a")
            .appendField(new Blockly.FieldDropdown([
                ["ACCESO", "HIGH"],
                ["SPENTO", "LOW"]
            ]), "STATE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle(STYLES.IO);
        this.setTooltip("Accende (ACCESO) o spegne (SPENTO) un pin. Come un interruttore della luce!");
    }
};

// 4. digitalRead
Blockly.Blocks['arduino_digital_read'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("leggi pin")
            .appendField(new Blockly.FieldNumber(2, 0, 19), "PIN");
        this.setOutput(true, ["Number", "Boolean"]);
        this.setStyle(STYLES.IO);
        this.setTooltip("Controlla se un pin e acceso o spento. Perfetto per leggere un pulsante!");
    }
};

// 5. analogWrite
Blockly.Blocks['arduino_analog_write'] = {
    init: function () {
        this.appendValueInput("VALUE")
            .setCheck("Number")
            .appendField("scrivi analogico pin")
            .appendField(new Blockly.FieldDropdown([
                ["3", "3"], ["5", "5"], ["6", "6"],
                ["9", "9"], ["10", "10"], ["11", "11"]
            ]), "PIN")
            .appendField("valore");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle(STYLES.IO);
        this.setTooltip("Scrive un valore analogico (PWM) tra 0 e 255 su un pin");
    }
};

// 6. analogRead
Blockly.Blocks['arduino_analog_read'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("leggi analogico pin")
            .appendField(new Blockly.FieldDropdown([
                ["A0", "A0"], ["A1", "A1"], ["A2", "A2"],
                ["A3", "A3"], ["A4", "A4"], ["A5", "A5"]
            ]), "PIN");
        this.setOutput(true, "Number");
        this.setStyle(STYLES.IO);
        this.setTooltip("Legge il valore dal pin analogico specificato (0 - 1023)");
    }
};

// 7. delay
Blockly.Blocks['arduino_delay'] = {
    init: function () {
        this.appendValueInput("DELAY_TIME")
            .setCheck("Number")
            .appendField("attendi (ms)");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle(STYLES.TIME);
        this.setTooltip("Ferma tutto per un po'. 1000 millisecondi = 1 secondo. Come dire 'aspetta un attimo'!");
    }
};

// 8. millis
Blockly.Blocks['arduino_millis'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("tempo trascorso (ms)");
        this.setOutput(true, "Number");
        this.setStyle(STYLES.TIME);
        this.setTooltip("Restituisce i millisecondi dall'accensione");
    }
};

// 9. serialBegin
Blockly.Blocks['arduino_serial_begin'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("avvia seriale a")
            .appendField(new Blockly.FieldDropdown([
                ["9600", "9600"], ["19200", "19200"], ["38400", "38400"],
                ["57600", "57600"], ["115200", "115200"]
            ]), "BAUD")
            .appendField("baud");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle(STYLES.SERIAL);
        this.setTooltip("Inizializza la comunicazione seriale");
    }
};

// 10. serialPrint
Blockly.Blocks['arduino_serial_print'] = {
    init: function () {
        this.appendValueInput("CONTENT")
            .appendField("stampa su seriale")
            .appendField(new Blockly.FieldCheckbox("TRUE"), "NEWLINE")
            .appendField("a capo");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle(STYLES.SERIAL);
        this.setTooltip("Stampa dati sulla porta seriale");
    }
};

// 11b. Serial.available()
Blockly.Blocks['arduino_serial_available'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("dati disponibili su seriale?");
        this.setOutput(true, "Boolean");
        this.setStyle(STYLES.SERIAL);
        this.setTooltip("Controlla se ci sono dati in arrivo sulla porta seriale");
    }
};

// 11c. Serial.read()
Blockly.Blocks['arduino_serial_read'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("leggi dalla seriale");
        this.setOutput(true, "Number");
        this.setStyle(STYLES.SERIAL);
        this.setTooltip("Legge un byte dalla porta seriale (restituisce un numero)");
    }
};

// 11d. pulseIn(pin, value)
Blockly.Blocks['arduino_pulse_in'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("misura impulso pin")
            .appendField(new Blockly.FieldNumber(7, 0, 13, 1), "PIN")
            .appendField(new Blockly.FieldDropdown([["ALTO", "HIGH"], ["BASSO", "LOW"]]), "VALUE");
        this.setOutput(true, "Number");
        this.setStyle(STYLES.IO);
        this.setTooltip("Misura la durata di un impulso su un pin (in microsecondi). Utile per sensori a ultrasuoni!");
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
    }
};

// ─── TONE / BUZZER ─── //

// 11. tone(pin, freq)
Blockly.Blocks['arduino_tone'] = {
    init: function () {
        this.appendValueInput("FREQ")
            .setCheck("Number")
            .appendField("suona pin")
            .appendField(new Blockly.FieldNumber(8, 0, 19), "PIN")
            .appendField("frequenza (Hz)");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle(STYLES.SOUND);
        this.setTooltip("Fa suonare una nota! 262=Do, 294=Re, 330=Mi, 440=La. Piu alto il numero, piu acuto il suono.");
    }
};

// 12. noTone(pin)
Blockly.Blocks['arduino_no_tone'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("ferma suono pin")
            .appendField(new Blockly.FieldNumber(8, 0, 19), "PIN");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle(STYLES.SOUND);
        this.setTooltip("Ferma il tono generato sul pin specificato");
    }
};

// ─── SERVO ─── //

// 13. Servo attach
Blockly.Blocks['arduino_servo_attach'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("collega servo")
            .appendField(new Blockly.FieldTextInput("myServo"), "NAME")
            .appendField("al pin")
            .appendField(new Blockly.FieldNumber(9, 0, 19), "PIN");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle(STYLES.SERVO);
        this.setTooltip("Collega il servo al pin specificato");
    }
};

// 14. Servo write
Blockly.Blocks['arduino_servo_write'] = {
    init: function () {
        this.appendValueInput("ANGLE")
            .setCheck("Number")
            .appendField("ruota servo")
            .appendField(new Blockly.FieldTextInput("myServo"), "NAME")
            .appendField("a gradi");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle(STYLES.SERVO);
        this.setTooltip("Ruota il servo all'angolo specificato (0-180)");
    }
};

// 15. Servo read
Blockly.Blocks['arduino_servo_read'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("angolo servo")
            .appendField(new Blockly.FieldTextInput("myServo"), "NAME");
        this.setOutput(true, "Number");
        this.setStyle(STYLES.SERVO);
        this.setTooltip("Legge l'angolo corrente del servo");
    }
};

// ─── LCD DISPLAY ─── //

// 16. LCD Init — Inizializza display LCD 16x2 con pin specificati
Blockly.Blocks['arduino_lcd_init'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("inizializza LCD  RS")
            .appendField(new Blockly.FieldNumber(12, 0, 19), "RS")
            .appendField(" E")
            .appendField(new Blockly.FieldNumber(11, 0, 19), "E");
        this.appendDummyInput()
            .appendField("  D4")
            .appendField(new Blockly.FieldNumber(5, 0, 19), "D4")
            .appendField(" D5")
            .appendField(new Blockly.FieldNumber(10, 0, 19), "D5")
            .appendField(" D6")
            .appendField(new Blockly.FieldNumber(3, 0, 19), "D6")
            .appendField(" D7")
            .appendField(new Blockly.FieldNumber(6, 0, 19), "D7");
        this.appendDummyInput()
            .appendField("  colonne")
            .appendField(new Blockly.FieldNumber(16, 1, 40), "COLS")
            .appendField("righe")
            .appendField(new Blockly.FieldNumber(2, 1, 4), "ROWS");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle(STYLES.LCD);
        this.setTooltip("Inizializza il display LCD con i pin specificati");
    }
};

// 17. LCD Print — Stampa testo su LCD
Blockly.Blocks['arduino_lcd_print'] = {
    init: function () {
        this.appendValueInput("TEXT")
            .appendField("scrivi su LCD");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle(STYLES.LCD);
        this.setTooltip("Stampa testo sul display LCD");
    }
};

// 18. LCD Set Cursor — Posiziona cursore
Blockly.Blocks['arduino_lcd_set_cursor'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("cursore LCD  colonna")
            .appendField(new Blockly.FieldNumber(0, 0, 39), "COL")
            .appendField("riga")
            .appendField(new Blockly.FieldNumber(0, 0, 3), "ROW");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle(STYLES.LCD);
        this.setTooltip("Posiziona il cursore LCD alla colonna e riga specificate");
    }
};

// 19. LCD Clear — Pulisci display
Blockly.Blocks['arduino_lcd_clear'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("pulisci LCD");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle(STYLES.LCD);
        this.setTooltip("Pulisci il display LCD");
    }
};

// ─── VARIABILI ─── //

// 16. Dichiarazione variabile
Blockly.Blocks['arduino_variable_set'] = {
    init: function () {
        this.appendValueInput("VALUE")
            .appendField("Dichiara")
            .appendField(new Blockly.FieldDropdown([
                ["int", "int"], ["float", "float"],
                ["long", "long"], ["bool", "bool"],
                ["String", "String"]
            ]), "TYPE")
            .appendField(new Blockly.FieldTextInput("x"), "VAR")
            .appendField("=");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle(STYLES.VARS);
        this.setTooltip("Dichiara una variabile con tipo e valore iniziale");
    }
};

// 17. Leggi variabile
Blockly.Blocks['arduino_variable_get'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("Variabile")
            .appendField(new Blockly.FieldTextInput("x"), "VAR");
        this.setOutput(true, null);
        this.setStyle(STYLES.VARS);
        this.setTooltip("Legge il valore di una variabile");
    }
};

// ─── RANDOM ─── //

// 18b. random(min, max) — inclusive
Blockly.Blocks['arduino_random'] = {
    init: function () {
        this.appendValueInput("MIN").setCheck("Number").appendField("random( da");
        this.appendValueInput("MAX").setCheck("Number").appendField("a");
        this.appendDummyInput().appendField(")");
        this.setInputsInline(true);
        this.setOutput(true, "Number");
        this.setStyle(STYLES.MATH_EXT);
        this.setTooltip("Genera un numero casuale tra min e max (incluso)");
    }
};

// ─── MAP ─── //

// 18. map(value, fromLow, fromHigh, toLow, toHigh)
Blockly.Blocks['arduino_map'] = {
    init: function () {
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
        this.appendValueInput("VALUE").setCheck("Number").appendField("map(");
        this.appendValueInput("FROM_LOW").setCheck("Number").appendField(", da");
        this.appendValueInput("FROM_HIGH").setCheck("Number").appendField("~");
        this.appendValueInput("TO_LOW").setCheck("Number").appendField(", a");
        this.appendValueInput("TO_HIGH").setCheck("Number").appendField("~");
        this.appendDummyInput().appendField(")");
        this.setInputsInline(true);
        this.setOutput(true, "Number");
        this.setStyle(STYLES.MATH_EXT);
        this.setTooltip("Rimappa un valore da un intervallo ad un altro");
    }
};

// ─── RGB LED ─── //
// Wave 1b Impl-A-2 (Sez 1 RGB LED category gap fill):
// Single block emitting three analogWrite() calls for a common-cathode RGB
// LED. IT labels verbatim Vol1/Vol2 — "imposta RGB su pin", canali R/G/B
// 0-255. NON wired in TOOLBOX_XML iter 82+ — consumed by getCanonicalToolbox()
// (scratchToolboxProgressive.js) for future ScratchEditor integration atom.
Blockly.Blocks['arduino_rgb_led'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("imposta RGB rosso pin")
            .appendField(new Blockly.FieldNumber(9, 0, 19), "PIN_R")
            .appendField("verde pin")
            .appendField(new Blockly.FieldNumber(10, 0, 19), "PIN_G")
            .appendField("blu pin")
            .appendField(new Blockly.FieldNumber(11, 0, 19), "PIN_B");
        this.appendValueInput("R")
            .setCheck("Number")
            .appendField("  rosso (0-255)");
        this.appendValueInput("G")
            .setCheck("Number")
            .appendField("  verde (0-255)");
        this.appendValueInput("B")
            .setCheck("Number")
            .appendField("  blu (0-255)");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle(STYLES.IO);
        this.setTooltip("Accende un LED RGB miscelando tre intensita (rosso, verde, blu) tra 0 e 255.");
    }
};
