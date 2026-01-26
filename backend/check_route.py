import os

import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()


from apps.routes.models import Route

route = Route.objects.get(id=27)
leg = route.route_leg
raw = leg.raw_data

print("=== RouteLeg 47 Raw Data (legs) ===\n")
if "legs" in raw:
    for i, leg_item in enumerate(raw["legs"]):
        print(f"[Leg {i}]")
        print(f"mode: {leg_item.get('mode')}")
        print(f"start: {leg_item.get('start', {}).get('name')}")
        print(f"end: {leg_item.get('end', {}).get('name')}")
        print(f"sectionTime: {leg_item.get('sectionTime')}")
        print(f"distance: {leg_item.get('distance')}")

        # 버스/지하철 세부 정보
        if leg_item.get("mode") == "BUS":
            print(f"bus_route: {leg_item.get('route')}")
            pass_stops = leg_item.get("passStopList", {}).get("stations", [])
            print(f"passStopList count: {len(pass_stops)}")
            if pass_stops:
                print(
                    f"첫 정류장: {pass_stops[0].get('stationName') if pass_stops else 'N/A'}"
                )
                print(
                    f"마지막 정류장: {pass_stops[-1].get('stationName') if len(pass_stops) > 0 else 'N/A'}"
                )
        elif leg_item.get("mode") == "SUBWAY":
            print(f"subway_line: {leg_item.get('route')}")
            pass_stops = leg_item.get("passStopList", {}).get("stations", [])
            print(f"passStopList count: {len(pass_stops)}")
            if pass_stops:
                print(
                    f"첫 역: {pass_stops[0].get('stationName') if pass_stops else 'N/A'}"
                )
                print(
                    f"마지막 역: {pass_stops[-1].get('stationName') if len(pass_stops) > 0 else 'N/A'}"
                )

        print()
