"""Public course proposal shared by HTTP and the bounded static projection.

No enrollment, identity, schedule or editorial approval is implied here.
"""

RADIUS_MIN = 0.5
RADIUS_MAX = 2.0
RADIUS_STEP = 0.05


def public_course():
    """Return a fresh public proposal, never a private edition or its calendar."""
    return {
        'id': 'fluidi-public-v1', 'version': 1, 'status': 'proposed',
        'title': 'Fluidi e ragionamento fisico',
        'scope': 'Proporzioni, unità e fluidi; non l’intero programma del semestre.',
        'duration': 'Quattro incontri proposti', 'capacity': 10,
        'priceMinor': None, 'sessions': [], 'timezone': 'Europe/Rome',
        'interestCollection': 'closed', 'editorialStatus': 'DRAFT',
    }
