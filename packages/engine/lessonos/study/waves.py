"""Original harmonic travelling-wave projection in SI; analytical, no integrator."""
import math

from .models import StudyError

DOMAIN = (
    'Onda armonica trasversale ideale in mezzo uniforme non dispersivo, propagazione '
    'verso +x: y(x,t) = A sin(2πx/λ − 2πft + φ), λ = v/f, T = 1/f. '
    'y è lo spostamento del mezzo, non la traiettoria di materia trasportata. '
    'Nessuna attenuazione, riflessione, interferenza o previsione di intensità. '
    'Il grafico temporale segue il punto x = 0. Tempo di simulazione esplicito, '
    'indipendente dall’orologio; massimo 10⁶ periodi per limitare la perdita numerica '
    'di fase. Il profilo ha 32 campioni per lunghezza d’onda, non è una misura continua.'
)


def evaluate_harmonic_wave(parameters):
    """Return one spatial profile and the probe's next two periods, in metres/seconds."""
    if not isinstance(parameters, dict) or set(parameters) - {
        'speed', 'frequency', 'amplitude', 'phase', 'time',
    }:
        raise StudyError('invalid_parameters')
    values = {}
    for key, default, low, high in (
        ('speed', 4, 1e-3, 3e8), ('frequency', 2, .01, 1e12),
        ('amplitude', .1, 0, 1000), ('phase', 0, -2 * math.pi, 2 * math.pi),
        ('time', 0, 0, 1e6),
    ):
        value = parameters.get(key, default)
        if type(value) not in (int, float) or not low <= value <= high or not math.isfinite(value):
            raise StudyError('invalid_physical_domain')
        values[key] = value
    frequency, amplitude = values['frequency'], values['amplitude']
    time, phase = values['time'], values['phase']
    if frequency * time > 1e6:
        raise StudyError('invalid_physical_domain')
    wavelength = values['speed'] / frequency
    period = 1 / frequency
    # Evaluate normalized coordinates directly, avoiding huge x/lambda ratios.
    # Reduce completed cycles BEFORE multiplying by 2pi. Otherwise an exactly
    # integral cycle count near the accepted limit gains a cancellation residue.
    cycles = math.remainder(frequency * time, 1)
    current_phase = math.remainder(phase - math.tau * cycles, math.tau)
    spatial = [
        {'xM': wavelength * index / 32,
         'displacementM': amplitude * math.sin(math.tau * index / 32 + current_phase)}
        for index in range(65)
    ]
    temporal = [
        {'timeS': time + period * index / 32,
         'displacementM': amplitude * math.sin(current_phase - math.tau * index / 32)}
        for index in range(65)
    ]
    return {
        'activityId': 'harmonic-wave-v1', 'version': 1, 'parameters': values,
        'value': wavelength, 'unit': 'm', 'wavelengthM': wavelength, 'periodS': period,
        'probeDisplacementM': spatial[0]['displacementM'],
        'spatialSamples': spatial, 'temporalSamples': temporal,
        'calculatedVariable': 'Lunghezza d’onda',
        'fixedQuantity': 'velocità di propagazione, frequenza e ampiezza',
        'domain': DOMAIN, 'editorialStatus': 'DRAFT', 'numericalCheck': 'deterministic',
    }
