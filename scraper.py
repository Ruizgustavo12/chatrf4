import json
import re
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import time

options = Options()
options.add_argument('--headless')
options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')

records = []

def extract_bg_image(style):
    """Extrae la URL de un background-image CSS."""
    m = re.search(r"background-image:\s*url\(['\"]?([^'\")\s]+)['\"]?\)", style or '')
    if m:
        url = m.group(1)
        if url.startswith('//'):
            url = 'https:' + url
        return url
    return ''

try:
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    driver.get('https://rf4game.com/records/weekly/region/EN/')
    time.sleep(8)

    all_rows = driver.find_elements(By.CSS_SELECTOR, '.records .row')
    print(f'Total filas: {len(all_rows)}')

    current_fish    = None
    current_img_pez = None
    rank            = 0

    for row in all_rows:
        cls = row.get_attribute('class') or ''

        # ── Fila de encabezado global (Fish | Weight | ...) ──────────────────
        fish_col = None
        try:
            fish_col = row.find_element(By.CSS_SELECTOR, '.col.fish')
        except:
            pass

        if not fish_col:
            continue

        fish_text = fish_col.text.strip()

        # Encabezado global — saltar
        if fish_text.lower() == 'fish':
            continue

        # ── Detectar si es fila de nombre de pez (header de especie) ─────────
        # Estas filas tienen la imagen del pez en background-image del .item_icon
        try:
            icon_el = fish_col.find_element(By.CSS_SELECTOR, '.item_icon')
            icon_style = icon_el.get_attribute('style') or ''
            img_pez = extract_bg_image(icon_style)
        except:
            img_pez = ''

        # Si tiene nombre de pez y es header de especie
        if fish_text and 'header' in cls:
            current_fish    = fish_text
            current_img_pez = img_pez or current_img_pez
            rank            = 0
            continue

        # ── Fila de jugador ───────────────────────────────────────────────────
        if not current_fish:
            continue

        # Leer columnas
        try:
            peso_el = row.find_element(By.CSS_SELECTOR, '.col.weight')
            peso = peso_el.text.strip().replace('\u00a0', ' ')
        except:
            continue  # sin peso = fila inválida

        if not peso:
            continue

        rank += 1
        if rank > 5:
            continue

        try:
            ubicacion = row.find_element(By.CSS_SELECTOR, '.col.location').text.strip()
        except:
            ubicacion = '—'

        # Señuelo: texto + imagen background
        senuelo    = '—'
        img_senuelo = ''
        try:
            bait_el  = row.find_element(By.CSS_SELECTOR, '.col.bait')
            senuelo  = bait_el.text.strip()
            try:
                bait_icon = bait_el.find_element(By.CSS_SELECTOR, '.item_icon')
                img_senuelo = extract_bg_image(bait_icon.get_attribute('style') or '')
            except:
                pass
        except:
            pass

        try:
            jugador = row.find_element(By.CSS_SELECTOR, '.col.player').text.strip()
        except:
            jugador = '—'

        try:
            fecha = row.find_element(By.CSS_SELECTOR, '.col.date').text.strip()
        except:
            fecha = '—'

        records.append({
            'pez':         current_fish,
            'rank':        rank,
            'img_pez':     current_img_pez,
            'peso':        peso,
            'ubicacion':   ubicacion,
            'señuelo':     senuelo,
            'img_senuelo': img_senuelo,
            'jugador':     jugador,
            'fecha':       fecha,
        })

    driver.quit()

    especies = len(set(r['pez'] for r in records))
    print(f'Records extraídos: {len(records)} de {especies} especies')
    print('Ejemplo:')
    print(json.dumps(records[:6], ensure_ascii=False, indent=2))

except Exception as e:
    print(f'Error: {e}')
    import traceback
    traceback.print_exc()

# ── Guardar JSON ──────────────────────────────────────────────────────────────
output = {
    'updated': datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC'),
    'records': records
}

with open('records.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print(f'records.json guardado con {len(records)} entradas')
