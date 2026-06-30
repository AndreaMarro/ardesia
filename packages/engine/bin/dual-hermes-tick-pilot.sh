#!/usr/bin/env bash
set -euo pipefail
exec "$HOME/lessonos/bin/factory-smart-tick.sh" "${@:-hook}"
