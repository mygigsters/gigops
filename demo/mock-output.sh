#!/usr/bin/env bash
# mock-output.sh — Simulates gigops CLI output for demo/README GIF
# Run: bash demo/mock-output.sh

set -e

# Colors
R='\033[0m'       # Reset
B='\033[1m'       # Bold
DIM='\033[2m'     # Dim
CYAN='\033[36m'
GREEN='\033[32m'
YELLOW='\033[33m'
RED='\033[31m'
BLUE='\033[34m'
MAG='\033[35m'
WHITE='\033[97m'
BG_GREEN='\033[42m'
BG_YELLOW='\033[43m'
BG_BLUE='\033[44m'

pause() { sleep "${1:-1.5}"; }
type_cmd() {
  printf '\n%b$ %b' "${DIM}" "${R}"
  for (( i=0; i<${#1}; i++ )); do
    printf '%s' "${1:$i:1}"
    sleep 0.04
  done
  echo
  sleep 0.3
}

# ── 1. Banner ────────────────────────────────────────────────
clear
echo ""
echo -e "${CYAN}${B}"
cat << 'EOF'
   _____ _        ____
  / ____(_)      / __ \
 | |  __ _  __ _| |  | |_ __  ___
 | | |_ | |/ _` | |  | | '_ \/ __|
 | |__| | | (_| | |__| | |_) \__ \
  \_____|_|\__, |\____/| .__/|___/
            __/ |      | |
           |___/       |_|
EOF
echo -e "${R}"
echo -e "  ${DIM}AI-powered gig evaluation & proposal engine${R}"
echo -e "  ${DIM}v0.1.0${R}"
echo ""
pause 2

# ── 2. Evaluate ──────────────────────────────────────────────
type_cmd "gigops evaluate https://airtasker.com/tasks/build-react-dashboard"

echo -e "${DIM}Fetching task details...${R}"
sleep 0.8
echo -e "${DIM}Analyzing with AI...${R}"
sleep 1.2
echo ""
echo -e "${B}┌─────────────────────────────────────────────────────┐${R}"
echo -e "${B}│${R}  ${CYAN}${B}Gig Evaluation Report${R}                               ${B}│${R}"
echo -e "${B}├─────────────────────────────────────────────────────┤${R}"
echo -e "${B}│${R}                                                     ${B}│${R}"
echo -e "${B}│${R}  ${DIM}Task:${R}   Build React Dashboard with API Integration   ${B}│${R}"
echo -e "${B}│${R}  ${DIM}Budget:${R} \$800 – \$1,200                                ${B}│${R}"
echo -e "${B}│${R}  ${DIM}Posted:${R} 2 hours ago                                  ${B}│${R}"
echo -e "${B}│${R}                                                     ${B}│${R}"
echo -e "${B}│${R}  ${B}Grade:${R}  ${BG_GREEN}${WHITE}${B} A ${R}    ${B}Score:${R} ${GREEN}4.2 / 5.0${R}                  ${B}│${R}"
echo -e "${B}│${R}                                                     ${B}│${R}"
echo -e "${B}│${R}  ${GREEN}✓${R} Clear requirements & spec provided               ${B}│${R}"
echo -e "${B}│${R}  ${GREEN}✓${R} Budget aligns with market rate                   ${B}│${R}"
echo -e "${B}│${R}  ${GREEN}✓${R} Client has 4.8★ rating (12 tasks completed)      ${B}│${R}"
echo -e "${B}│${R}  ${YELLOW}△${R} Tight deadline (5 days)                          ${B}│${R}"
echo -e "${B}│${R}  ${RED}✗${R} No mention of ongoing maintenance                ${B}│${R}"
echo -e "${B}│${R}                                                     ${B}│${R}"
echo -e "${B}│${R}  ${B}Recommendation:${R} ${GREEN}${B}★ Apply${R} — strong fit for your skills ${B}│${R}"
echo -e "${B}│${R}                                                     ${B}│${R}"
echo -e "${B}└─────────────────────────────────────────────────────┘${R}"
pause 3

# ── 3. Propose ───────────────────────────────────────────────
type_cmd "gigops propose https://airtasker.com/tasks/build-react-dashboard"

echo -e "${DIM}Generating proposal...${R}"
sleep 1.5
echo ""
echo -e "${B}┌─────────────────────────────────────────────────────┐${R}"
echo -e "${B}│${R}  ${MAG}${B}Generated Proposal${R}                                  ${B}│${R}"
echo -e "${B}├─────────────────────────────────────────────────────┤${R}"
echo -e "${B}│${R}                                                     ${B}│${R}"
echo -e "${B}│${R}  ${DIM}Subject:${R} ${B}React Dashboard — Delivered in 4 Days${R}      ${B}│${R}"
echo -e "${B}│${R}  ${DIM}Rate:${R}    \$950 (within budget)                        ${B}│${R}"
echo -e "${B}│${R}                                                     ${B}│${R}"
echo -e "${B}│${R}  Hi! I'd love to help build your React dashboard.  ${B}│${R}"
echo -e "${B}│${R}  I've built 15+ data-heavy dashboards with React   ${B}│${R}"
echo -e "${B}│${R}  and REST/GraphQL integrations.                    ${B}│${R}"
echo -e "${B}│${R}                                                     ${B}│${R}"
echo -e "${B}│${R}  ${B}My approach:${R}                                        ${B}│${R}"
echo -e "${B}│${R}  ${CYAN}1.${R} Day 1 — wireframe review & component scaffold   ${B}│${R}"
echo -e "${B}│${R}  ${CYAN}2.${R} Day 2-3 — core dashboard + API layer            ${B}│${R}"
echo -e "${B}│${R}  ${CYAN}3.${R} Day 4 — polish, responsive QA, handoff          ${B}│${R}"
echo -e "${B}│${R}                                                     ${B}│${R}"
echo -e "${B}│${R}  ${GREEN}✓ Copied to clipboard${R}                               ${B}│${R}"
echo -e "${B}│${R}                                                     ${B}│${R}"
echo -e "${B}└─────────────────────────────────────────────────────┘${R}"
pause 3

# ── 4. Rate Check ────────────────────────────────────────────
type_cmd 'gigops rate-check "React Developer" --location Australia'

echo -e "${DIM}Fetching market rates...${R}"
sleep 1
echo ""
echo -e "${B}┌─────────────────────────────────────────────────────┐${R}"
echo -e "${B}│${R}  ${BLUE}${B}Market Rate Report${R}                                  ${B}│${R}"
echo -e "${B}├─────────────────────────────────────────────────────┤${R}"
echo -e "${B}│${R}                                                     ${B}│${R}"
echo -e "${B}│${R}  ${DIM}Role:${R}     React Developer                            ${B}│${R}"
echo -e "${B}│${R}  ${DIM}Location:${R} Australia                                   ${B}│${R}"
echo -e "${B}│${R}  ${DIM}Sources:${R}  Airtasker, Freelancer, Upwork              ${B}│${R}"
echo -e "${B}│${R}                                                     ${B}│${R}"
echo -e "${B}│${R}  ${DIM}Hourly${R}          ${RED}\$45${R}  ▰▰▰▰▱▱▱▱▱▱  ${GREEN}\$120${R}          ${B}│${R}"
echo -e "${B}│${R}  ${DIM}Median:${R}         ${B}\$75/hr${R}                             ${B}│${R}"
echo -e "${B}│${R}                                                     ${B}│${R}"
echo -e "${B}│${R}  ${DIM}Fixed (typical)${R} \$600 – \$3,500                        ${B}│${R}"
echo -e "${B}│${R}  ${DIM}Median project:${R} ${B}\$1,400${R}                              ${B}│${R}"
echo -e "${B}│${R}                                                     ${B}│${R}"
echo -e "${B}│${R}  ${YELLOW}💡${R} Your configured rate (\$85/hr) is ${GREEN}above median${R}    ${B}│${R}"
echo -e "${B}│${R}                                                     ${B}│${R}"
echo -e "${B}└─────────────────────────────────────────────────────┘${R}"
pause 3

# ── 5. Pipeline ──────────────────────────────────────────────
type_cmd "gigops pipeline list"

echo ""
echo -e "${B}┌──────┬────────────────────────────────┬──────────┬───────────┐${R}"
echo -e "${B}│${R} ${DIM}#${R}    ${B}│${R} ${DIM}Task${R}                           ${B}│${R} ${DIM}Status${R}   ${B}│${R} ${DIM}Value${R}     ${B}│${R}"
echo -e "${B}├──────┼────────────────────────────────┼──────────┼───────────┤${R}"
echo -e "${B}│${R} ${CYAN}001${R}  ${B}│${R} React Dashboard (Airtasker)    ${B}│${R} ${GREEN}Applied${R}  ${B}│${R} \$950     ${B}│${R}"
echo -e "${B}│${R} ${CYAN}002${R}  ${B}│${R} Node.js API Migration          ${B}│${R} ${YELLOW}Evaluating${R}${B}│${R} \$2,400   ${B}│${R}"
echo -e "${B}│${R} ${CYAN}003${R}  ${B}│${R} Landing Page Redesign          ${B}│${R} ${BG_GREEN}${WHITE}${B} Won ${R}    ${B}│${R} \$600     ${B}│${R}"
echo -e "${B}│${R} ${CYAN}004${R}  ${B}│${R} Mobile App Bug Fixes           ${B}│${R} ${RED}Passed${R}   ${B}│${R} \$350     ${B}│${R}"
echo -e "${B}│${R} ${CYAN}005${R}  ${B}│${R} WordPress Plugin Development   ${B}│${R} ${BLUE}Proposed${R} ${B}│${R} \$1,100   ${B}│${R}"
echo -e "${B}├──────┴────────────────────────────────┴──────────┴───────────┤${R}"
echo -e "${B}│${R}  ${DIM}Pipeline total:${R} ${B}\$5,400${R}   ${DIM}Win rate:${R} ${GREEN}${B}42%${R}                   ${B}│${R}"
echo -e "${B}└──────────────────────────────────────────────────────────────┘${R}"
echo ""
pause 2

echo -e "${DIM}Try ${CYAN}gigops --help${DIM} to get started${R}"
echo ""
