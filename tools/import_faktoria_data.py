import sqlite3
import json
import os

def create_database(db_path):
    """Tworzy bazę danych i definiuje schemat tabel."""
    print(f"Tworzenie bazy danych w: {db_path}")
    
    # Usunięcie istniejącej bazy danych, aby zapewnić świeży import
    if os.path.exists(db_path):
        os.remove(db_path)
        print("Usunięto istniejącą bazę danych.")

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Tabela dla aukcji (Sell Orders)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS aukcje (
        id TEXT PRIMARY KEY,
        item_id TEXT,
        item_name TEXT,
        price REAL NOT NULL,
        quantity INTEGER NOT NULL,
        gear_score INTEGER,
        tier INTEGER,
        perks TEXT,
        timestamp TEXT
    )
    ''')
    print("Utworzono tabelę 'aukcje'.")

    # Tabela dla zleceń kupna (Buy Orders)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS zlecenia_kupna (
        id TEXT PRIMARY KEY,
        item_id TEXT,
        item_name TEXT,
        price REAL NOT NULL,
        quantity INTEGER NOT NULL,
        gear_score INTEGER,
        tier INTEGER,
        perks TEXT,
        timestamp TEXT
    )
    ''')
    print("Utworzono tabelę 'zlecenia_kupna'.")

    # Indeksy dla szybszego wyszukiwania
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_aukcje_item_name ON aukcje (item_name)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_aukcje_price ON aukcje (price)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_zlecenia_kupna_item_name ON zlecenia_kupna (item_name)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_zlecenia_kupna_price ON zlecenia_kupna (price)')
    print("Utworzono indeksy.")

    conn.commit()
    conn.close()

def import_json_to_table(db_path, json_path, table_name):
    """Importuje dane z pliku JSON do określonej tabeli w bazie danych."""
    if not os.path.exists(json_path):
        print(f"Plik JSON nie został znaleziony: {json_path}")
        return

    print(f"Importowanie danych z {json_path} do tabeli '{table_name}'...")
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    conn.execute('BEGIN TRANSACTION')
    try:
        for item in data:
            perks_json = json.dumps(item.get('perks'))
            cursor.execute(f'''
            INSERT INTO {table_name} (id, item_id, item_name, price, quantity, gear_score, tier, perks, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                item.get('id'),
                item.get('item_id'),
                item.get('item_name'),
                item.get('price'),
                item.get('quantity'),
                item.get('gear_score'),
                item.get('tier'),
                perks_json,
                item.get('timestamp')
            ))
        conn.commit()
        print(f"Pomyślnie zaimportowano {len(data)} rekordów.")
    except Exception as e:
        conn.rollback()
        print(f"Wystąpił błąd podczas importu: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    # Definicja ścieżek
    # Zakładamy, że skrypt jest uruchamiany z głównego katalogu projektu
    DB_DIRECTORY = "apps/electron/data"
    DB_PATH = os.path.join(DB_DIRECTORY, "faktoria.sqlite")
    JSON_AUKCJE_PATH = "data-ai/2025-09-17_Aries-Aukcje-sample.json"
    JSON_KUPNO_PATH = "data-ai/2025-09-17_Aries-Kupno-sample.json"

    # Upewnij się, że katalog na bazę danych istnieje
    os.makedirs(DB_DIRECTORY, exist_ok=True)

    # Uruchomienie procesu
    create_database(DB_PATH)
    import_json_to_table(DB_PATH, JSON_AUKCJE_PATH, "aukcje")
    import_json_to_table(DB_PATH, JSON_KUPNO_PATH, "zlecenia_kupna")
    
    print("\nProces importu zakończony.")
