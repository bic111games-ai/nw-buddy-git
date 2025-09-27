import os
import re
from tqdm import tqdm   # pasek postępu

def search_components(root_dir, search_terms, output_file):
    r"""
    Przeszukuje pliki .ts w podanym katalogu w poszukiwaniu fraz, zapisuje wyniki do pliku TXT.
    
    Args:
        root_dir (str): Katalog główny do przeszukania (np. r'D:\NW_F-aktoria_App3\nw-buddy\nw-buddy').
        search_terms (list): Lista fraz do wyszukania (np. ['NwbDataViewComponent']).
        output_file (str): Ścieżka do pliku TXT (np. r'D:\NW_F-aktoria_App3\nw-buddy\nw-buddy\helpai\search_results.txt').
    """
    results = []
    
    # Regex dla fraz, ignorując wielkość liter
    patterns = [re.compile(re.escape(term), re.IGNORECASE) for term in search_terms]
    
    # Zlicz wszystkie pliki .ts (żeby znać 100%)
    ts_files = []
    for root, _, files in os.walk(root_dir):
        for file in files:
            if file.endswith('.ts'):
                ts_files.append(os.path.join(root, file))
    
    # Pasek postępu
    for file_path in tqdm(ts_files, desc="Przeszukiwanie plików", unit="plik"):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
                for line_num, line in enumerate(lines, 1):
                    for term, pattern in zip(search_terms, patterns):
                        if pattern.search(line):
                            results.append(f"{term}|{file_path}|{line_num}|{line.strip()}")
        except Exception as e:
            print(f"Błąd podczas czytania {file_path}: {e}")
    
    # Zapisz wyniki do pliku tekstowego
    if not results:
        print("⚠️ Nie znaleziono wyników.")
        return
    
    # Usuń duplikaty
    results = list(dict.fromkeys(results))
    
    with open(output_file, "w", encoding="utf-8") as out:
        out.write("\n".join(results))
    
    print(f"✅ Wyniki zapisano do: {output_file}")


if __name__ == "__main__":
    root_directory = r"D:\NW_F-aktoria_App3\nw-buddy\nw-buddy"
    terms_to_search = [
         'nwb-data-view'
         'DataViewComponent'
         'DataViewModule'
         'nwb-header'
         'LayoutModule'
         'nwb-quicksearch'
         'QuicksearchComponent'
         'QuicksearchModule'
         'nwbSplitGutter'
         'SplitGutterComponent'
         'nwbSplitPane'
         'SplitPaneDirective'
    ]
    output_txt = r"D:\NW_F-aktoria_App3\nw-buddy\nw-buddy\helpai\search_results.txt"
    
    search_components(root_directory, terms_to_search, output_txt)
