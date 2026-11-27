# Integrazione nel registro

Il registro accetta il campo opzionale `supplementalPractice` per i lotti che hanno concluso la verifica distinta. Ogni voce fissa ID, hash del pacchetto e hash del report. La verifica di coesistenza usa il medesimo importatore e riporta le prove aggiuntive in `supplementalRecords`. I record sorgente restano in `records`. Fino alla consegna indipendente, questo pacchetto rimane fuori dal registro.
