import argparse
import json
import sys
from pathlib import Path
from datetime import datetime

# Allow running without installing the package
sys.path.insert(0, str((Path(__file__).resolve().parents[1] / "src")))

from saju import todays_fortune


def main() -> int:
    parser = argparse.ArgumentParser(description="Try saju.todays_fortune API")
    parser.add_argument("--birthday", required=True, help="YYYY-MM-DD")
    parser.add_argument("--birthtime", required=True, help="HH:MM (24h)")
    parser.add_argument("--gender", required=True, choices=["M", "F"], help="M or F")
    parser.add_argument(
        "--today",
        help="Override today's date as YYYY-MM-DD (optional)",
    )
    parser.add_argument("--timeout", type=float, default=15.0, help="Network timeout seconds")
    args = parser.parse_args()

    today_date = None
    if args.today:
        today_date = datetime.strptime(args.today, "%Y-%m-%d").date()

    try:
        result = todays_fortune.get(
            birthday=args.birthday,
            birthtime=args.birthtime,
            gender=args.gender,
            today_date=today_date,
            timeout_seconds=args.timeout,
        )
    except Exception as e:
        print(f"Request failed: {e}")
        return 1

    print("== Request payload ==")
    print(json.dumps(result.request_payload, ensure_ascii=False, indent=2))

    print("\n== Parsed ==")
    print(json.dumps(result.parsed, ensure_ascii=False, indent=2))

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
