import json
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

try:
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    driver.get('https://rf4game.com/records/weekly/region/EN/')
    time.sleep(8)

    # Imprimir el HTML de las primeras 5 filas para ver la estructura real
    all_rows = driver.find_elements(By.CSS_SELECTOR, '.records .row')
    print(f'Total filas: {len(all_rows)}')

    for i, row in enumerate(all_rows[:10]):
        cls  = row.get_attribute('class') or ''
        html = row.get_attribute('innerHTML') or ''
        text = row.text.strip().replace('\n', ' | ')
        print(f'\n--- Row {i:02d} class="{cls}" ---')
        print(f'TEXT: {text[:200]}')
        print(f'HTML: {html[:400]}')

    driver.quit()

except Exception as e:
    print(f'Error: {e}')
    import traceback
    traceback.print_exc()

output = {'updated': datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC'), 'records': []}
with open('records.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)
