---
id: accelerometro-mpu6050
type: concept
title: "MPU6050 — accelerometro + giroscopio I2C"
locale: it
volume_ref: 3
pagina_ref: 185
created_at: 2026-04-26
updated_at: 2026-04-26
updated_by: scribe
tags: [mpu6050, accelerometro, giroscopio, imu, i2c, vol3]
---

## Definizione

L'**MPU6050** è un IMU (Inertial Measurement Unit) 6-DOF: 3 assi accelerometro + 3 assi giroscopio in un solo chip. Vol. 3 pag. 185 introduce: "MPU6050 è il sensore che ha smartphone e console gaming — sa quando la lavatrice scuote, quando il telefono si gira, quando saltate".

Pinout (8 pin, ne servono 4):
- **VCC** — 3.3V o 5V (modulo ha regulator)
- **GND** — massa
- **SCL** — I2C clock (Arduino A5)
- **SDA** — I2C data (Arduino A4)
- AD0/INT/XCL/XDA — opzionali (skip per uso base)

## Cosa misura

| Grandezza | 3 assi | Unità | Range typical |
|-----------|--------|-------|---------------|
| Accelerazione | X, Y, Z | g (9.81 m/s²) | ±2g, ±4g, ±8g, ±16g |
| Velocità angolare | X, Y, Z | °/s | ±250, ±500, ±1000, ±2000 |
| Temperatura | (interno) | °C | -40 a +85 |

**Note**: gravità terrestre = 1g. A riposo orizzontale: AccelZ ≈ 1g (16384 LSB con range ±2g), AccelX/Y ≈ 0.

## Schema collegamento

```
Arduino       MPU6050
  +5V    ───→ VCC
  GND    ───→ GND
  A4 SDA ←──→ SDA
  A5 SCL ←──→ SCL
```

**I2C indirizzo**: `0x68` default (`0x69` se AD0 a HIGH).

## Codice Arduino base (libreria)

```cpp
#include <Wire.h>
#include <MPU6050.h>

MPU6050 mpu;

void setup() {
  Wire.begin();
  Serial.begin(9600);
  mpu.initialize();
  if (!mpu.testConnection()) Serial.println("MPU6050 NON connesso");
  else Serial.println("MPU6050 OK");
}

void loop() {
  int16_t ax, ay, az, gx, gy, gz;
  mpu.getMotion6(&ax, &ay, &az, &gx, &gy, &gz);

  // Convert to g (range ±2g default → 16384 LSB/g)
  float accelX_g = ax / 16384.0;
  float accelY_g = ay / 16384.0;
  float accelZ_g = az / 16384.0;

  Serial.print("Accel X="); Serial.print(accelX_g, 2);
  Serial.print(" Y="); Serial.print(accelY_g, 2);
  Serial.print(" Z="); Serial.println(accelZ_g, 2);
  delay(100);
}
```

## Calcolo inclinazione (pitch + roll)

```cpp
#include <math.h>

void calcolaInclinazione(float ax, float ay, float az,
                          float *pitch, float *roll) {
  *pitch = atan2(ax, sqrt(ay*ay + az*az)) * 180.0 / PI;
  *roll  = atan2(ay, sqrt(ax*ax + az*az)) * 180.0 / PI;
}

// In loop:
float pitch, roll;
calcolaInclinazione(accelX_g, accelY_g, accelZ_g, &pitch, &roll);
Serial.print("Pitch="); Serial.print(pitch);
Serial.print(" Roll="); Serial.println(roll);
```

A riposo orizzontale: pitch≈0, roll≈0. Inclinato 45°: pitch=45 OR roll=45.

## Esempio Vol. 3 — bolla livella digitale

```cpp
const int PIN_LED_VERDE = 5;
const int PIN_LED_GIALLO = 6;
const int PIN_LED_ROSSO = 7;

void loop() {
  // ... lettura accel + calcolo pitch/roll ...

  float inclinaz = max(abs(pitch), abs(roll));

  digitalWrite(PIN_LED_VERDE, inclinaz < 5);   // perfetto
  digitalWrite(PIN_LED_GIALLO, inclinaz >= 5 && inclinaz < 15);  // poco
  digitalWrite(PIN_LED_ROSSO, inclinaz >= 15);  // tanto
}
```

Vol. 3 pag. 188 estende: bolla livella visiva con servo + display.

## Calibrazione zero

A riposo, valori NON sono perfetti zero (offset di fabbrica). Vol. 3 pag. 190 raccomanda calibrazione setup:

```cpp
int16_t offsetX = 0, offsetY = 0, offsetZ = 0;

void calibra() {
  long sumX = 0, sumY = 0, sumZ = 0;
  const int CAMPIONI = 100;

  for (int i = 0; i < CAMPIONI; i++) {
    int16_t ax, ay, az;
    mpu.getAcceleration(&ax, &ay, &az);
    sumX += ax; sumY += ay; sumZ += az;
    delay(10);
  }
  offsetX = sumX / CAMPIONI;
  offsetY = sumY / CAMPIONI;
  offsetZ = sumZ / CAMPIONI - 16384;  // -1g aspettato a riposo
}
```

Sottrarre offsets da letture per zero corretto.

## Errori comuni

1. **Mancanza Wire.begin()** — Senza, `mpu.initialize()` fallisce silenzioso. Sintomo: `testConnection()` ritorna false. Sempre `Wire.begin()` in setup.

2. **Indirizzo I2C sbagliato** — Default 0x68. Se AD0 collegato a VCC → 0x69. Lanciare scanner I2C (vedi `i2c-spi.md`) se default fallisce.

3. **Range accelerometro non match interpretazione** — Library MPU6050 default ±2g (16384 LSB/g). Cambiare range con `mpu.setFullScaleAccelRange(MPU6050_ACCEL_FS_4)` cambia LSB/g (8192 per ±4g, ecc).

4. **Drift giroscopio** — Giroscopio integrato accumula errore (~1°/s drift tipico). Per posizione precisa serve sensor fusion (Kalman filter, complementary filter). Da solo OK per movimento, NON per posizione assoluta.

5. **Vibrazioni meccaniche** — Letture accelerometro disturbate da vibrazioni motore/macchina. Filtro low-pass software (media mobile) o hardware (capacitore decoupling).

6. **Pinout VCC 3.3 vs 5V** — Modulo MPU6050 ha regulator interno per 5V→3.3V chip, MA alcuni cloni economici accettano SOLO 3.3V. Verificare datasheet modulo specifico.

## Esperimenti correlati

- **Vol. 3 pag. 185** — Primo MPU6050: lettura raw + Serial Monitor
- **Vol. 3 pag. 188** — Bolla livella digitale con LED
- **Vol. 3 pag. 190** — Calibrazione + offset
- **Vol. 3 pag. 195** — Pedometer (contapassi) con thresholding accelerazione
- **Vol. 3 pag. 200** — Drone-like stabilizer (capstone, IMU + servo + PID)

## PRINCIPIO ZERO

**Cosa dire ai ragazzi** (citazione Vol. 3 pag. 185):
> "MPU6050 è il sensore che ha smartphone e console gaming — sa quando la lavatrice scuote, quando il telefono si gira, quando saltate."

**Cosa fare:**
- Vol. 3 pag. 185 raccomanda di insegnare MPU6050 DOPO I2C basics (vedi `i2c-spi.md`) e dopo array
- Mostrate empiricamente: muovete la breadboard avanti/indietro, vedete X cambia. Inclinate, vedete Z. Ragazzi capiscono "il sensore SENTE il movimento"
- Bolla livella digitale è iconic: applicabile a casa (per quadri, mensole). Connessione mondo reale forte
- Spiegate che smartphone/auto/gaming usano stesso sensore — coinvolgimento alto
- Calibrazione è concetto importante: "nessun sensore è perfetto, dobbiamo dirgli dove è lo zero"

**Sicurezza:**
- MPU6050 è passivo. Sicuro per ragazzi.
- Verificate VCC: 3.3V o 5V dipende dal modulo. Default kit ELAB 5V OK.
- Movimenti rapidi → accelerometro saturato (>2g). Cambiare range se serve range più ampio.

**Cosa NON fare:**
- Non aspettatevi posizione GPS-like da MPU6050. È IMU, non posizione assoluta.
- Non insegnate sensor fusion/Kalman prima di basics — concetti avanzati post-superiore
- Non lasciate cicli lettura senza delay → satura I2C bus, altri device perdono comunicazione

## Link L1 (raw RAG queries)

- `"MPU6050 accelerometro giroscopio Arduino"`
- `"I2C 0x68 indirizzo MPU6050"`
- `"calcolo pitch roll inclinazione accelerometro"`
- `"calibrazione offset MPU6050 zero"`
- `"sensor fusion Kalman complementary filter"`
