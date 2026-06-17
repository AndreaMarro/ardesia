#!/bin/bash
# Wrapper: la review decorrelata condivisa vive in ~/lessonos/bin/review.sh (parametrizzata via REVIEW_REPO).
REVIEW_REPO="$HOME/maestro-studio" exec "$HOME/lessonos/bin/review.sh" "$@"
