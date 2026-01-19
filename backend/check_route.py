import sys
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.routes.models import Route
from apps.itineraries.models import RouteLeg, RouteSegment
import json

route = Route.objects.get(id=27)
leg = route.route_leg
raw = leg.raw_data

print("=== RouteLeg 47 Raw Data (legs) ===\n")
if 'legs' in raw:
    for i, l in enumerate(raw['legs']):
        print(f"[Leg {i}]")
        print(f"mode: {l.get('mode')}")
        print(f"start: {l.get('start', {}).get('name')}")
        print(f"end: {l.get('end', {}).get('name')}")
        print(f"sectionTime: {l.get('sectionTime')}")
        print(f"distance: {l.get('distance')}")

        # 버스/지하철 세부 정보
        if l.get('mode') == "BUS":
            print(f"bus_route: {l.get('route')}")
            pass_stops = l.get('passStopList', {}).get('stations', [])
            print(f"passStopList count: {len(pass_stops)}")
            if pass_stops:
                print(f"첫 정류장: {pass_stops[0].get('stationName') if pass_stops else 'N/A'}")
                print(f"마지막 정류장: {pass_stops[-1].get('stationName') if len(pass_stops) > 0 else 'N/A'}")
        elif l.get('mode') == "SUBWAY":
            print(f"subway_line: {l.get('route')}")
            pass_stops = l.get('passStopList', {}).get('stations', [])
            print(f"passStopList count: {len(pass_stops)}")
            if pass_stops:
                print(f"첫 역: {pass_stops[0].get('stationName') if pass_stops else 'N/A'}")
                print(f"마지막 역: {pass_stops[-1].get('stationName') if len(pass_stops) > 0 else 'N/A'}")

        print()
