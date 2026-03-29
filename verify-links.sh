#!/bin/bash
#===========================================================
# GitHub Link Verifier Script
# Verifies all GitHub URLs in a README.md file
# Features: parallel checking, rate limiting, redirect following
# Output: working.txt, broken.txt, and summary
#===========================================================

set -e

README="$1"
MAX_PARALLEL=10
MAX_TIME=10
DELAY_MS=100

if [ -z "$README" ]; then
    echo "Usage: $0 <readme.md>"
    echo "Example: $0 /tmp/fitness/README.md"
    exit 1
fi

if [ ! -f "$README" ]; then
    echo "Error: File not found: $README"
    exit 1
fi

echo "=============================================="
echo "  GitHub Link Verifier"
echo "=============================================="
echo "Checking links in: $README"
echo "Parallel checks: $MAX_PARALLEL"
echo "Max timeout: ${MAX_TIME}s"
echo "Rate limit delay: ${DELAY_MS}ms"
echo "=============================================="

# Create temp files
TEMP_DIR=$(mktemp -d)
WORKING_FILE="$TEMP_DIR/working.txt"
BROKEN_FILE="$TEMP_DIR/broken.txt"
ALL_URLS_FILE="$TEMP_DIR/all_urls.txt"
PIPE_FILE="$TEMP_DIR/url_pipe"

# Cleanup on exit
trap "rm -rf $TEMP_DIR" EXIT

# Extract all unique GitHub URLs
grep -oE 'https://github\.com/[a-zA-Z0-9_-]+/[a-zA-Z0-9_.-]+' "$README" | sort -u > "$ALL_URLS_FILE"

TOTAL_URLS=$(wc -l < "$ALL_URLS_FILE")
echo ""
echo "Found $TOTAL_URLS unique GitHub URLs to check"
echo ""

if [ "$TOTAL_URLS" -eq 0 ]; then
    echo "No GitHub URLs found in README"
    exit 0
fi

# Initialize output files
> "$WORKING_FILE"
> "$BROKEN_FILE"

# Create named pipe for parallel processing
rm -f "$PIPE_FILE"
mkfifo "$PIPE_FILE"

# Function to check a single URL
check_url() {
    local url="$1"
    local temp_result=$(mktemp)
    
    # Check HTTP status with redirect following
    status=$(curl -s -o /dev/null -w "%{http_code}" -L --max-time "$MAX_TIME" \
        -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" \
        "$url" 2>/dev/null || echo "000")
    
    if [ "$status" = "200" ]; then
        echo "✅ $url" >> "$WORKING_FILE"
    else
        echo "❌ $url (HTTP $status)" >> "$BROKEN_FILE"
    fi
    
    # Rate limiting delay
    sleep 0.$DELAY_MS
    
    rm -f "$temp_result"
}

export -f check_url
export WORKING_FILE BROKEN_FILE MAX_TIME DELAY_MS

# Run parallel checks using xargs with parallelism
cat "$ALL_URLS_FILE" | xargs -P "$MAX_PARALLEL" -I {} bash -c 'check_url "$@"' _ {} 2>/dev/null || true

# Also do it sequentially if parallel fails (fallback)
if [ ! -s "$WORKING_FILE" ] && [ ! -s "$BROKEN_FILE" ]; then
    echo "Falling back to sequential checking..."
    while IFS= read -r url; do
        check_url "$url"
        echo -n "."
    done < "$ALL_URLS_FILE"
    echo ""
fi

# Sort results
sort -o "$WORKING_FILE" "$WORKING_FILE"
sort -o "$BROKEN_FILE" "$BROKEN_FILE"

# Output results
echo ""
echo "=============================================="
echo "  RESULTS"
echo "=============================================="

WORKING_COUNT=$(wc -l < "$WORKING_FILE")
BROKEN_COUNT=$(wc -l < "$BROKEN_FILE")

echo ""
echo "✅ WORKING LINKS ($WORKING_COUNT):"
echo "----------------------------------------------"
cat "$WORKING_FILE" 2>/dev/null || echo "(none)"

echo ""
echo "❌ BROKEN LINKS ($BROKEN_COUNT):"
echo "----------------------------------------------"
cat "$BROKEN_FILE" 2>/dev/null || echo "(none)"

# Copy output files to current directory
cp "$WORKING_FILE" ./working-links.txt 2>/dev/null || true
cp "$BROKEN_FILE" ./broken-links.txt 2>/dev/null || true

echo ""
echo "=============================================="
echo "  SUMMARY"
echo "=============================================="
echo "Total URLs checked: $TOTAL_URLS"
echo "✅ Working: $WORKING_COUNT"
echo "❌ Broken: $BROKEN_COUNT"
echo ""
echo "Output files saved:"
echo "  - working-links.txt (✅ links)"
echo "  - broken-links.txt (❌ links)"
echo "=============================================="

# Return error code if broken links found
if [ "$BROKEN_COUNT" -gt 0 ]; then
    exit 1
fi

exit 0
