"""Errors visible across application boundaries."""

class Problem(Exception):
    def __init__(self, message, status=400):
        super().__init__(message)
        self.status = status


def require(test, message, status=400):
    if not test:
        raise Problem(message, status)
