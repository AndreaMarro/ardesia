"""Abstract base class for all dataset sections."""
from abc import ABC, abstractmethod


class Section(ABC):
    """Base class for a dataset section.

    Each section generates training examples for a specific category
    (e.g., actions, dialects, teacher_clueless). Subclasses implement
    the generate() method to produce examples in ChatML format.
    """

    def __init__(self, config: dict):
        self.id = config["id"]
        self.name = config["name"]
        self.config = config

    @abstractmethod
    def generate(self, target_count: int) -> list[dict]:
        """Generate up to target_count examples.

        Returns:
            List of ChatML dicts: [{"messages": [system, user, assistant]}]
        """
        ...
