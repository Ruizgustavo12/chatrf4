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
    m = re.search(r"background-image:\s*url\(['\"]?([^'\")\s]+)['\"]?\)", style or '')
    if m:
        url = m.group(1)
        if url.startswith('//'):
            url = 'https:' + url
        return url
    return ''

def rf4game_to_stat(url):
    """Convierte URL de rf4game.com/res/48x48/X.png a en.rf4-stat.ru que sí carga en browser"""
    if not url:
        return ''
    # extraer nombre del archivo
    m = re.search(r'/48x48/([^/?#]+)', url)
    if m:
        return 'https://en.rf4-stat.ru/images/rf4game/' + m.group(1)
    m2 = re.search(r'/res/[^/]+/([^/?#]+)', url)
    if m2:
        return 'https://en.rf4-stat.ru/images/rf4game/' + m2.group(1)
    return url

try:
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    driver.get('https://rf4game.com/records/weekly/region/EN/')
    time.sleep(8)

    # Hacer visible todos los div.rows
    driver.execute_script("""
        document.querySelectorAll('.records_subtable .rows').forEach(function(el){
            el.style.display = 'block';
        });
    """)
    time.sleep(1)

    subtables = driver.find_elements(By.CSS_SELECTOR, '.records_subtable')
    print(f'Subtablas: {len(subtables)}')

    for subtable in subtables:
        pez = ''
        img_pez = ''
        try:
            header = subtable.find_element(By.CSS_SELECTOR, '.row.header')
            fish_col = header.find_element(By.CSS_SELECTOR, '.col.fish')
            try:
                pez = fish_col.find_element(By.CSS_SELECTOR, '.text').text.strip()
            except:
                pez = fish_col.text.strip()
            try:
                icon_style = fish_col.find_element(By.CSS_SELECTOR, '.item_icon').get_attribute('style') or ''
                img_pez = rf4game_to_stat(extract_bg_image(icon_style))
            except:
                pass

            if not pez:
                continue

            # Rank 1 desde el header
            peso_r1 = ''
            try:
                peso_r1 = header.find_element(By.CSS_SELECTOR, '.col.weight').text.strip().replace('\u00a0', ' ')
            except:
                pass

            if peso_r1:
                ubicacion_r1 = ''
                try:
                    ubicacion_r1 = header.find_element(By.CSS_SELECTOR, '.col.location').text.strip()
                except:
                    pass

                senuelo_r1 = ''
                img_senuelo_r1 = ''
                try:
                    bait_icon = header.find_element(By.CSS_SELECTOR, '.bait_icon')
                    senuelo_r1 = bait_icon.get_attribute('title') or ''
                    img_senuelo_r1 = rf4game_to_stat(extract_bg_image(bait_icon.get_attribute('style') or ''))
                except:
                    pass

                jugador_r1 = ''
                try:
                    jugador_r1 = header.find_element(By.CSS_SELECTOR, '.col.gamername').text.strip()
                except:
                    pass

                fecha_r1 = ''
                try:
                    fecha_r1 = header.find_element(By.CSS_SELECTOR, '.col.data').text.strip()
                except:
                    pass

                records.append({
                    'pez': pez, 'rank': 1, 'img_pez': img_pez,
                    'peso': peso_r1, 'ubicacion': ubicacion_r1,
                    'señuelo': senuelo_r1, 'img_senuelo': img_senuelo_r1,
                    'jugador': jugador_r1, 'fecha': fecha_r1,
                })

        except:
            continue

        # Ranks 2-5
        try:
            rows_container = subtable.find_element(By.CSS_SELECTOR, '.rows')
            player_rows = rows_container.find_elements(By.CSS_SELECTOR, '.row')
        except:
            continue

        rank = 1
        for row in player_rows:
            peso = ''
            try:
                peso = row.find_element(By.CSS_SELECTOR, '.col.weight').text.strip().replace('\u00a0', ' ')
            except:
                pass
            if not peso:
                continue

            rank += 1
            if rank > 5:
                break

            ubicacion = ''
            try:
                ubicacion = row.find_element(By.CSS_SELECTOR, '.col.location').text.strip()
            except:
                pass

            senuelo = ''
            img_senuelo = ''
            try:
                bait_icon = row.find_element(By.CSS_SELECTOR, '.bait_icon')
                senuelo = bait_icon.get_attribute('title') or ''
                img_senuelo = rf4game_to_stat(extract_bg_image(bait_icon.get_attribute('style') or ''))
            except:
                pass

            jugador = ''
            try:
                jugador = row.find_element(By.CSS_SELECTOR, '.col.gamername').text.strip()
            except:
                pass

            fecha = ''
            try:
                fecha = row.find_element(By.CSS_SELECTOR, '.col.data').text.strip()
            except:
                pass

            records.append({
                'pez': pez, 'rank': rank, 'img_pez': img_pez,
                'peso': peso, 'ubicacion': ubicacion,
                'señuelo': senuelo, 'img_senuelo': img_senuelo,
                'jugador': jugador, 'fecha': fecha,
            })

    driver.quit()

    especies = len(set(r['pez'] for r in records))
    print(f'Records: {len(records)} de {especies} especies')
    print('Ejemplo img:', records[0]['img_pez'] if records else 'ninguno')

except Exception as e:
    print(f'Error: {e}')
    import traceback
    traceback.print_exc()

output = {
    'updated': datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC'),
    'records': records
}
with open('records.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print(f'records.json guardado con {len(records)} entradas')
