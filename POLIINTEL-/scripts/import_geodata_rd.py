#!/usr/bin/env python3
"""
import_geodata_rd.py — Import Dominican Republic geodata into POLIINTEL Supabase
Uses Supabase PostgREST REST API with service_role key (no direct DB needed).
Reprojects from EPSG:32619 (UTM Zone 19N) to EPSG:4326 (WGS84).

Usage:
    python3 scripts/import_geodata_rd.py
"""

import json
import math
import sys
import time
import urllib.request
import urllib.parse
from pathlib import Path

# ─── Config ───────────────────────────────────────────────────────────────────
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6ZnJ3bG93bG1pZHp4cnlmdW9kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTEzNTMyNCwiZXhwIjoyMDkwNzExMzI0fQ.mdHph3RFusYD07LAfthkko8IL_C6M7-uQ8gpTqjB8zw"
BASE_URL    = "https://gzfrwlowlmidzxryfuod.supabase.co/rest/v1"
GEODATA_DIR = Path(__file__).parent.parent / "geodata"

# ─── UTM 19N → WGS84 conversion (no external library needed) ─────────────────
# Based on standard UTM reverse projection formulas (WGS84 ellipsoid)
def utm_to_wgs84(easting: float, northing: float, zone: int = 19, northern: bool = True):
    """Convert UTM Zone 19N coordinates to WGS84 (lon, lat)."""
    a  = 6378137.0          # WGS84 semi-major axis
    f  = 1 / 298.257223563  # WGS84 flattening
    b  = a * (1 - f)
    e2 = 1 - (b / a) ** 2
    e  = math.sqrt(e2)
    k0 = 0.9996

    x = easting - 500000.0
    y = northing if northern else northing - 10000000.0

    lon0 = math.radians((zone - 1) * 6 - 180 + 3)

    M  = y / k0
    mu = M / (a * (1 - e2/4 - 3*e2**2/64 - 5*e2**3/256))

    e1 = (1 - math.sqrt(1 - e2)) / (1 + math.sqrt(1 - e2))
    J1 = 3*e1/2  - 27*e1**3/32
    J2 = 21*e1**2/16 - 55*e1**4/32
    J3 = 151*e1**3/96
    J4 = 1097*e1**4/512

    fp = mu + J1*math.sin(2*mu) + J2*math.sin(4*mu) + J3*math.sin(6*mu) + J4*math.sin(8*mu)

    e1sq = e2 / (1 - e2)
    C1   = e1sq * math.cos(fp)**2
    T1   = math.tan(fp)**2
    R1   = a * (1 - e2) / (1 - e2 * math.sin(fp)**2)**1.5
    N1   = a / math.sqrt(1 - e2 * math.sin(fp)**2)
    D    = x / (N1 * k0)

    lat = fp - (N1 * math.tan(fp) / R1) * (
        D**2/2 - (5 + 3*T1 + 10*C1 - 4*C1**2 - 9*e1sq) * D**4/24 +
        (61 + 90*T1 + 298*C1 + 45*T1**2 - 252*e1sq - 3*C1**2) * D**6/720
    )
    lon = lon0 + (
        D - (1 + 2*T1 + C1)*D**3/6 +
        (5 - 2*C1 + 28*T1 - 3*C1**2 + 8*e1sq + 24*T1**2) * D**5/120
    ) / math.cos(fp)

    return math.degrees(lon), math.degrees(lat)

def reproject_coord(coord):
    """Reproject a single [x, y] coordinate, rounded to 5 decimals (~1m precision)."""
    lon, lat = utm_to_wgs84(coord[0], coord[1])
    return [round(lon, 5), round(lat, 5)]

def reproject_ring(ring):
    return [reproject_coord(c) for c in ring]

def reproject_polygon(coords):
    return [reproject_ring(ring) for ring in coords]

def reproject_geometry(geom):
    """Reproject geometry from UTM19N to WGS84."""
    gtype = geom["type"]
    if gtype == "Polygon":
        return {"type": "MultiPolygon", "coordinates": [reproject_polygon(geom["coordinates"])]}
    elif gtype == "MultiPolygon":
        return {"type": "MultiPolygon", "coordinates": [reproject_polygon(p) for p in geom["coordinates"]]}
    elif gtype == "Point":
        lon, lat = utm_to_wgs84(geom["coordinates"][0], geom["coordinates"][1])
        return {"type": "Point", "coordinates": [round(lon, 7), round(lat, 7)]}
    return geom

# ─── REST API helpers ─────────────────────────────────────────────────────────
def rest_get_all(table: str, select: str = "*") -> list:
    """Get ALL rows from a table paginating by 1000."""
    result = []
    offset = 0
    page   = 1000
    while True:
        url = f"{BASE_URL}/{table}?select={select}&limit={page}&offset={offset}"
        req = urllib.request.Request(url, headers={
            "apikey": SERVICE_KEY,
            "Authorization": f"Bearer {SERVICE_KEY}",
        })
        with urllib.request.urlopen(req, timeout=30) as r:
            batch = json.loads(r.read())
        result.extend(batch)
        if len(batch) < page:
            break
        offset += page
    return result

def rest_insert(table: str, rows: list, retry: int = 2) -> tuple[int, str | None]:
    """Insert a list of dicts via REST API. Returns (count_inserted, error)."""
    if not rows:
        return 0, None
    data = json.dumps(rows).encode()
    req  = urllib.request.Request(
        f"{BASE_URL}/{table}",
        data=data,
        method="POST",
        headers={
            "apikey": SERVICE_KEY,
            "Authorization": f"Bearer {SERVICE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal,resolution=ignore-duplicates",
        }
    )
    for attempt in range(retry + 1):
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                return len(rows), None
        except urllib.error.HTTPError as e:
            err = e.read().decode()
            if attempt < retry:
                time.sleep(1)
            else:
                return 0, f"HTTP {e.code}: {err[:150]}"
        except Exception as e:
            if attempt < retry:
                time.sleep(1)
            else:
                return 0, str(e)[:150]
    return 0, "failed"

def count_table(table: str) -> int:
    """Get exact count using content-range header."""
    req = urllib.request.Request(
        f"{BASE_URL}/{table}?select=id",
        headers={
            "apikey": SERVICE_KEY,
            "Authorization": f"Bearer {SERVICE_KEY}",
            "Prefer": "count=exact",
            "Range": "0-0",
        }
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            cr = r.headers.get("content-range", "")
            # format: 0-0/1596 or */1596
            if "/" in cr:
                return int(cr.split("/")[1])
    except:
        pass
    return -1

# ─── Helpers ──────────────────────────────────────────────────────────────────
def esc(s: str) -> str:
    """Escape string for SQL."""
    return s.replace("'", "''") if s else ""

def geom_ewkt(geojson_geom: dict) -> str:
    """Convert reprojected GeoJSON geometry to compact PostGIS EWKT string."""
    gtype  = geojson_geom["type"]
    coords = geojson_geom["coordinates"]

    def fmt(c):
        return f"{c[0]} {c[1]}"

    def ring_wkt(ring):
        # Deduplicate consecutive identical points to reduce size
        pts = [ring[0]]
        for p in ring[1:]:
            if p != pts[-1]:
                pts.append(p)
        if pts[-1] != pts[0]:
            pts.append(pts[0])  # close ring
        return "(" + ",".join(fmt(c) for c in pts) + ")"

    def polygon_wkt(poly):
        return "(" + ",".join(ring_wkt(r) for r in poly) + ")"

    if gtype == "MultiPolygon":
        inner = ",".join(polygon_wkt(p) for p in coords)
        return f"SRID=4326;MULTIPOLYGON({inner})"
    elif gtype == "Polygon":
        return f"SRID=4326;MULTIPOLYGON(({ring_wkt(coords[0])}))"
    elif gtype == "Point":
        return f"SRID=4326;POINT({coords[0]} {coords[1]})"
    return None


# ─── Step 1: REGIONES ─────────────────────────────────────────────────────────
def import_regiones():
    print("\n[1/6] Importando REGIONES...")
    with open(GEODATA_DIR / "RD_REG_20220630.json") as f:
        data = json.load(f)

    rows = []
    for feat in data["features"]:
        p    = feat["properties"]
        geom = reproject_geometry(feat["geometry"])
        rows.append({
            "nombre": p["TOPONIMIA"].title(),
            "codigo": p["CODREG"].zfill(2),
            "geom":   geom_ewkt(geom),
        })

    cnt, err = rest_insert("regiones", rows)
    if err:
        print(f"  ✗ Error: {err}")
    else:
        total = count_table("regiones")
        print(f"  ✓ {total} regiones en DB")


# ─── Step 2: PROVINCIAS ───────────────────────────────────────────────────────
def import_provincias():
    print("\n[2/6] Importando PROVINCIAS...")
    reg_list = rest_get_all("regiones", "codigo,id")
    region_by_code = {r["codigo"]: r["id"] for r in reg_list}

    with open(GEODATA_DIR / "RD_PROV.json") as f:
        data = json.load(f)

    rows = []
    for feat in data["features"]:
        p    = feat["properties"]
        geom = reproject_geometry(feat["geometry"])
        row  = {
            "nombre":    p["TOPONIMIA"].title(),
            "codigo":    p["PROV"].zfill(2),
            "geom":      geom_ewkt(geom),
        }
        reg_id = region_by_code.get(p["REG"].zfill(2))
        if reg_id:
            row["region_id"] = reg_id
        rows.append(row)

    cnt, err = rest_insert("provincias", rows)
    if err:
        print(f"  ✗ Error: {err}")
    else:
        total = count_table("provincias")
        print(f"  ✓ {total} provincias en DB")


# ─── Step 3: MUNICIPIOS ───────────────────────────────────────────────────────
def import_municipios():
    print("\n[3/6] Importando MUNICIPIOS (158 features)...")
    prov_list = rest_get_all("provincias", "codigo,id")
    prov_by_code = {r["codigo"]: r["id"] for r in prov_list}

    with open(GEODATA_DIR / "RD_MUNICIPIOS.json") as f:
        data = json.load(f)

    total_ins = 0
    batch_size = 10
    features = data["features"]
    for i in range(0, len(features), batch_size):
        chunk = features[i:i+batch_size]
        rows  = []
        for feat in chunk:
            p    = feat["properties"]
            geom = reproject_geometry(feat["geometry"])
            name = (p.get("TOPO2") or p["TOPONIMIA"]).title()
            row  = {
                "nombre": name,
                "codigo": str(p["ENLACE"]).zfill(4),
                "geom":   geom_ewkt(geom),
            }
            pv = prov_by_code.get(p["PROV"].zfill(2))
            if pv:
                row["provincia_id"] = pv
            rows.append(row)
        cnt, err = rest_insert("municipios", rows)
        if err:
            print(f"  ⚠ batch err: {err[:80]}")
        else:
            total_ins += cnt
        print(f"  {min(i+batch_size,len(features))}/{len(features)}", end="\r", flush=True)
        time.sleep(0.15)
    total = count_table("municipios")
    print(f"  ✓ {total} municipios en DB                ")


# ─── Step 4: DISTRITOS MUNICIPALES ────────────────────────────────────────────
def import_distritos():
    print("\n[4/6] Importando DISTRITOS MUNICIPALES (393 features)...")
    mun_list = rest_get_all("municipios", "codigo,id")
    mun_by_code = {r["codigo"]: r["id"] for r in mun_list}

    with open(GEODATA_DIR / "RD_DM.json") as f:
        data = json.load(f)

    features = data["features"]
    batch_size = 8
    for i in range(0, len(features), batch_size):
        chunk = features[i:i+batch_size]
        rows  = []
        for feat in chunk:
            p      = feat["properties"]
            geom   = reproject_geometry(feat["geometry"])
            enlace = str(p["ENLACE"]).zfill(6)
            name   = (p.get("TOPO2") or p["TOPONIMIA"]).title()
            row    = {
                "nombre": name,
                "codigo": enlace,
                "geom":   geom_ewkt(geom),
            }
            mv = mun_by_code.get(enlace[:4].zfill(4))
            if mv:
                row["municipio_id"] = mv
            rows.append(row)
        cnt, err = rest_insert("distritos_municipales", rows)
        if err:
            print(f"  ⚠ batch err: {err[:80]}")
        print(f"  {min(i+batch_size,len(features))}/{len(features)}", end="\r", flush=True)
        time.sleep(0.15)
    total = count_table("distritos_municipales")
    print(f"  ✓ {total} distritos en DB                ")


# ─── Step 5: SECCIONES ────────────────────────────────────────────────────────
def import_secciones():
    print("\n[5/6] Importando SECCIONES (1596 features — ~3 min)...")
    dm_list = rest_get_all("distritos_municipales", "codigo,id")
    dm_by_code = {r["codigo"]: r["id"] for r in dm_list}

    # Get already imported codes to skip
    existing = rest_get_all("secciones", "codigo")
    existing_codes = {r["codigo"] for r in existing}

    with open(GEODATA_DIR / "RD_SECCIONES.json") as f:
        data = json.load(f)

    features = [f for f in data["features"]
                if str(f["properties"]["ENLACE"]).zfill(8) not in existing_codes]
    print(f"  Faltan {len(features)} de {len(data['features'])} secciones...")

    errors = 0
    for i, feat in enumerate(features):
        p      = feat["properties"]
        geom   = reproject_geometry(feat["geometry"])
        enlace = str(p["ENLACE"]).zfill(8)
        name   = (str(p.get("TOPO2") or p["TOPONIMIA"])).title()[:200]
        row    = {
            "nombre": name,
            "codigo": enlace,
            "geom":   geom_ewkt(geom),
        }
        dv = dm_by_code.get(enlace[:6])
        if dv:
            row["distrito_id"] = dv
        cnt, err = rest_insert("secciones", [row])
        if err:
            errors += 1
            if errors <= 5:
                print(f"  ⚠ #{i+1} err: {err[:80]}")
        print(f"  {i+1}/{len(features)} (err:{errors})", end="\r", flush=True)
        time.sleep(0.05)
    total = count_table("secciones")
    print(f"  ✓ {total} secciones en DB                ")


# ─── Step 6: CENTROS POBLADOS → recintos_electorales ─────────────────────────
def import_centros():
    print("\n[6/6] Importando CENTROS POBLADOS → recintos_electorales (1545)...")
    sec_list = rest_get_all("secciones", "codigo,id")
    sec_by_dm: dict[str, str] = {}
    for s in sec_list:
        dm_key = s["codigo"][:6]
        if dm_key not in sec_by_dm:
            sec_by_dm[dm_key] = s["id"]

    # Get already imported codes
    existing = rest_get_all("recintos_electorales", "codigo")
    existing_codes = {r["codigo"] for r in existing}

    with open(GEODATA_DIR / "RD_CentrosPoblados_20221231.json") as f:
        data = json.load(f)

    features = data["features"]
    errors   = 0
    inserted = 0

    for i in range(0, len(features), 30):
        chunk = features[i:i+30]
        rows  = []
        for feat in chunk:
            p      = feat["properties"]
            fid    = str(p.get("fid", i))
            code   = f"CP{fid.zfill(5)}"
            if code in existing_codes:
                continue
            geom_r = reproject_geometry(feat["geometry"])
            lon, lat = geom_r["coordinates"][0], geom_r["coordinates"][1]
            enlace = str(p["ENLACE"]).zfill(6)
            name   = (p.get("TOPO2") or p["TOPONIMIA"]).title()
            row    = {
                "nombre": name[:200],
                "codigo": code,
                "lat":    round(lat, 7),
                "lng":    round(lon, 7),
                "geom":   f"SRID=4326;POINT({round(lon,5)} {round(lat,5)})",
            }
            sv = sec_by_dm.get(enlace)
            if sv:
                row["seccion_id"] = sv
            rows.append(row)
        if rows:
            cnt, err = rest_insert("recintos_electorales", rows)
            if err:
                errors += 1
            else:
                inserted += cnt
        print(f"  {min(i+30,len(features))}/{len(features)} (err:{errors})", end="\r", flush=True)
        time.sleep(0.1)
    total = count_table("recintos_electorales")
    print(f"  ✓ {total} recintos en DB                ")


# ─── Final validation ─────────────────────────────────────────────────────────
def validate():
    print("\n=== Validación Final ===")
    expected = {
        "regiones": 10,
        "provincias": 32,
        "municipios": 158,
        "distritos_municipales": 393,
        "secciones": 1596,
        "recintos_electorales": 1545,
    }
    all_ok = True
    for table, exp in expected.items():
        cnt = count_table(table)
        ok  = cnt >= exp * 0.9
        sym = "✓" if ok else "✗"
        if not ok:
            all_ok = False
        print(f"  {sym} {table}: {cnt} (esperado ~{exp})")

    if all_ok:
        print("\n✅ Toda la geodata importada correctamente.")
    else:
        print("\n⚠ Algunas tablas podrían estar incompletas.")


# ─── Main ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("=" * 60)
    print("POLIINTEL — Importación de Geodata RD")
    print("=" * 60)

    import_regiones()
    import_provincias()
    import_municipios()
    import_distritos()
    import_secciones()
    import_centros()
    validate()
