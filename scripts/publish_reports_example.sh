#!/usr/bin/env bash
set -euo pipefail

CPANEL_USER="stopazi"
CPANEL_HOST="xenlabz.com"
REMOTE_PATH="/home/stopazi/public_html/xensignal/reports"

LOCAL_SHADOW="${1:-Production/reports/historical_shadow/shadow_replay_summary.json}"
LOCAL_OPTIMIZER="${2:-Production/state/xensignal_profit_optimizer.json}"

scp "$LOCAL_SHADOW" "${CPANEL_USER}@${CPANEL_HOST}:${REMOTE_PATH}/latest-shadow-summary.json"
scp "$LOCAL_OPTIMIZER" "${CPANEL_USER}@${CPANEL_HOST}:${REMOTE_PATH}/latest-optimizer-state.json"

echo "Published XenSignal reports."
