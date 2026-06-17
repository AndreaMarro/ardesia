#!/usr/bin/env bash
# MAESTRO — selezione account Claude per i worker headless.
#   A1 = account principale (token in ~/.zshenv, come oggi)
#   A2 = secondo account OPZIONALE (token in ~/.maestro-account2.env, chmod 600)
# Senza il file A2 tutto si comporta come prima (A1-only): attivazione automatica.
# Uso:
#   acct.sh pick          -> stampa il primo account con quota libera (A1 poi A2); exit 1 se nessuno
#   acct.sh token <ACC>   -> stampa il token dell'account
#   acct.sh has A2        -> exit 0 se A2 e' configurato
set -euo pipefail
Q="$HOME/lessonos/bin/quota.sh"
A2F="$HOME/.maestro-account2.env"
A3F="$HOME/.maestro-account3.env"
case "${1:-}" in
  pick)
    if bash "$Q" check A1 >/dev/null 2>&1; then echo A1; exit 0; fi
    if [ -f "$A2F" ] && bash "$Q" check A2 >/dev/null 2>&1; then echo A2; exit 0; fi
    if [ -f "$A3F" ] && bash "$Q" check A3 >/dev/null 2>&1; then echo A3; exit 0; fi
    exit 1
    ;;
  token)
    case "${2:-A1}" in
      A2)
        [ -f "$A2F" ] || exit 1
        # shellcheck disable=SC1090
        . "$A2F"
        printf '%s' "${CLAUDE_CODE_OAUTH_TOKEN_2:-}"
        ;;
      A3)
        [ -f "$A3F" ] || exit 1
        # shellcheck disable=SC1090
        . "$A3F"
        printf '%s' "${CLAUDE_CODE_OAUTH_TOKEN_3:-}"
        ;;
      *)
        eval "$(grep -E '^[[:space:]]*export[[:space:]]+CLAUDE_CODE_OAUTH_TOKEN=' "$HOME/.zshenv" 2>/dev/null | tail -1)"
        printf '%s' "${CLAUDE_CODE_OAUTH_TOKEN:-}"
        ;;
    esac
    ;;
  has)
    case "${2:-}" in
      A2) [ -f "$A2F" ] ;;
      A3) [ -f "$A3F" ] ;;
      *) false ;;
    esac
    ;;
  *)
    echo "uso: acct.sh pick | token <A1|A2> | has A2" >&2
    exit 2
    ;;
esac
