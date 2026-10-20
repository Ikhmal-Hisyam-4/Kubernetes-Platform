#!/usr/bin/env bash
# Pretty health check — run ON the k3s server VM (no terraform / SSH needed).
# Uses kubectl, so it covers all nodes.
#
# Usage: ./health-check-vm.sh

set -uo pipefail

K="sudo kubectl"
ISSUES=0

# ---------- colors (off when not a terminal) ----------
if [ -t 1 ]; then
  G=$'\e[32m'; R=$'\e[31m'; Y=$'\e[33m'; B=$'\e[34m'; C=$'\e[36m'
  BOLD=$'\e[1m'; DIM=$'\e[2m'; N=$'\e[0m'
else
  G=""; R=""; Y=""; B=""; C=""; BOLD=""; DIM=""; N=""
fi

ok()   { printf "  ${G}✔${N} %s\n" "$1"; }
bad()  { printf "  ${R}✘${N} %s\n" "$1"; ISSUES=$((ISSUES + 1)); }
warn() { printf "  ${Y}!${N} %s\n" "$1"; }
title() { printf "\n${BOLD}${B}━━ %s ${N}\n" "$1"; }

# bar <percent> -> 20-char usage bar, colored by load
bar() {
  local pct=${1%\%} width=20 color=$G
  [ "$pct" -ge 70 ] && color=$Y
  [ "$pct" -ge 90 ] && color=$R
  local filled=$((pct * width / 100))
  [ "$filled" -gt "$width" ] && filled=$width
  local i
  printf "${color}"
  for ((i = 0; i < filled; i++)); do printf '█'; done
  printf "${DIM}"
  for ((i = filled; i < width; i++)); do printf '░'; done
  printf "${N} %3s%%" "$pct"
}

printf "${BOLD}${C}"
echo "╔══════════════════════════════════════════════╗"
echo "║        kubex-k3s  •  Cluster Health          ║"
echo "╚══════════════════════════════════════════════╝"
printf "${N}${DIM}  %s${N}\n" "$(date '+%a %d %b %Y, %H:%M:%S')"

# ---------- nodes ----------
title "Nodes"
while read -r name status _; do
  if [ "$status" = "Ready" ]; then ok "$name  ${DIM}Ready${N}"; else bad "$name  $status"; fi
done < <($K get nodes --no-headers 2>/dev/null)

# ---------- node resources ----------
title "Node CPU / RAM"
printf "  ${DIM}%-20s %-28s %s${N}\n" "NODE" "CPU" "RAM"
while read -r name _ cpu _ mem; do
  printf "  %-20s " "$name"
  bar "$cpu"; printf "   "; bar "$mem"; echo
done < <($K top nodes --no-headers 2>/dev/null)

# ---------- pods ----------
title "Pods"
for ns in kubex monitoring; do
  total=$($K get pods -n "$ns" --no-headers 2>/dev/null | wc -l)
  running=$($K get pods -n "$ns" --no-headers 2>/dev/null | awk '$3=="Running" || $3=="Completed"' | wc -l)
  if [ "$total" -gt 0 ] && [ "$running" -eq "$total" ]; then
    ok "$ns  ${DIM}$running/$total healthy${N}"
  else
    bad "$ns  $running/$total healthy"
  fi
done

broken=$($K get pods -A --no-headers --field-selector=status.phase!=Running,status.phase!=Succeeded 2>/dev/null)
if [ -n "$broken" ]; then
  echo "$broken" | while read -r ns pod _; do printf "    ${R}↳ %s/%s${N}\n" "$ns" "$pod"; done
fi

# ---------- app pods memory ----------
title "App pods (kubex)"
printf "  ${DIM}%-34s %-8s %s${N}\n" "POD" "CPU" "RAM"
$K top pods -n kubex --no-headers 2>/dev/null | while read -r pod cpu mem; do
  printf "  %-34s %-8s %s\n" "$pod" "$cpu" "$mem"
done

# ---------- website ----------
title "Website"
for target in "app.kubex.my /" "api.kubex.my /docs"; do
  set -- $target
  code=$(curl -s -o /dev/null -m 10 -w "%{http_code}" -H "Host: $1" "http://localhost$2")
  if [ "$code" = "200" ]; then ok "$1$2  ${DIM}HTTP $code${N}"; else bad "$1$2  HTTP $code"; fi
done

# ---------- prometheus ----------
title "Prometheus"
res=$($K exec -n monitoring deploy/prometheus -c prometheus -- \
  wget -qO- "http://localhost:9090/api/v1/query?query=up" 2>/dev/null \
  | python3 -c '
import json, sys
r = json.load(sys.stdin)["data"]["result"]
print(sum(1 for x in r if x["value"][1] == "1"), len(r))
' 2>/dev/null)
if [ -z "$res" ]; then
  bad "cannot query Prometheus"
else
  up=${res% *}; all=${res#* }
  if [ "$up" = "$all" ]; then ok "targets up  ${DIM}$up/$all${N}"; else bad "targets up  $up/$all"; fi
fi

# ---------- this VM ----------
title "This VM"
disk=$(df / | awk 'NR==2 {gsub("%","",$5); print $5}')
printf "  disk  "; bar "$disk"; echo
[ "$disk" -ge 85 ] && warn "disk is getting full"

# ---------- summary ----------
echo
if [ "$ISSUES" -eq 0 ]; then
  printf "${BOLD}${G}  ✔ ALL HEALTHY${N}\n\n"
else
  printf "${BOLD}${R}  ✘ %s ISSUE(S) FOUND${N}\n\n" "$ISSUES"
fi
exit "$ISSUES"
