### ***Etap 1***###

na podstawie strony /items stworzyć taką samą podstronę i nazwać ją faktoria. 
Strona oparta jest na "tabeli", dodaj kolumny do już istniejących na podstawie pobieranych plików z danymi, pomiń już istniejące. tworząc kolumny z plików Aukcje do "timestamp", "created_at", "expires_at", "price", "quantity" trzeba dodać znacznik _aukcje np. "price_aukcje"
tak samo z plikami Kupno trzeba dodać kolumny na podstawie danych z pliku "timestamp", "created_at", "expires_at", "price", "quantity" trzeba dodać znacznik _kupno np. "price_kupno"

"timestamp", "created_at", "expires_at", "server_id", "trading_category", "Weapons",
"trading_family", "trading_group", "item_id", "gear_score", "tier", "price", "quantity", "perks", "item_name"

- 2025-09-17_Aries-Aukcje.json "timestamp", "created_at", "expires_at", "server_id", "trading_category", "Weapons",
"trading_family", "trading_group", "item_id", "gear_score", "tier", "price", "quantity", "perks", "item_name"
-2025-09-17_Aries-Kupno.json  "timestamp", "created_at", "expires_at", "server_id", "trading_category", "Weapons",
"trading_family", "trading_group", "item_id", "gear_score", "tier", "price", "quantity", "perks", "item_name"

nazwy kolumn w /items
Icon , Name , Item ID , Perks , Perks Validity , Attr. Mods , Rarity , Tier , Item Type Name , Bookmark , In Stock , Owned GS , Price , Gear Score , Source , Shops , Event , Expansion , Item Type , Item Class , Trading Group , Trading Family , Trading Category , Transform To , Transform From , Acquisition Notification Id , Armor Appearance F , Armor Appearance M , Audio Created , Audio Destroyed , Audio Pickup , Audio Place , Audio Use , Bind On Equip , Bind On Pickup , Can Have Perks , Can Replace Gem , Can Roll Perk On Upgrade , Confirm Before Use , Confirm Destroy , Consume On Use , Container GS , Container Level , Crafting Recipe , Death Drop Percentage , Description , Destroy On Break , Durability , Durability Dmg On Death , Event Id , Exceed Max Index , Exceed Min Index , Exclusively For War Camp Tier , Extra Bonus Item Chance , FFAConverted Item Id , Force Rarity , Gear Score Override , Grants HWMBump , Heartgem Rune Tooltip Title , Heartgem Tooltip Background Image , Hi Res Icon Path , Hide From Reward Open Popup , Hide In Loot Ticker , Housing Tags , Icon Path , Ignore HWMScaling , Ignore Name Changes , Ignore Parent Columns  DVT , Ingredient Bonus Pri Apry , Ingredient Bonus Pri Augy , Ingredient Bonus Pri Mayy , Ingredient Bonus Primary , Ingredient Bonus Secondary , Ingredient Categories , Ingredient Gear Score Base Bonus , Ingredient Gear Score Max Bonus , Is Mission Item , Is Repairable , Is Required Item , Is Salvageable , Is Unique Item , Item Stats Ref , Mannequin Tag , Max Craft GS , Max Gear Score , Max Stack Size , Min Gear Score , Mount Item Appearance , No Bind On Pickup Chance , Nonremovable , Not Droppable , Not Droppable Notification Override , Notes , Obtainable Release Version , On Equip Objective Id , Parent Item Id  DVT , Per Perk Scaling Multiplier , Perk1 , Perk2 , Perk3 , Perk4 , Perk5 , Perk Bucket1 , Perk Bucket2 , Perk Bucket3 , Perk Bucket4 , Perk Bucket5 , Perk Slot1 , Perk Slot2 , Perk Slot3 , Perk Slot4 , Perk Slot5 , Prefab Path , Repair Dust Modifier , Repair Game Event ID , Repair Recipe , Repair Types , Required Expansion Id , Required Level , Required Tradeskill Rank , Required World Tags , Retired In Release Version , Salvage Achievement , Salvage Entitlement Id , Salvage Game Event ID , Salvage Guaranteed Perk Count , Salvage Loot Tags , Salvage Resources , Schedule Id , Sound Table ID , Ui Item Class , Use Magic Affix , Use Material Affix , Use Type Affix , Warboard Deposit Stat , Warboard Gather Stat , Weapon Accessory , Weapon Appearance Override , Weight , Add Status Effects , Affliction Damage , Base Damage Modifier , Base Damage Type , Consumable ID , Cooldown Duration , Cooldown Id , DMGVitals Category , Damage , Damage Type , Disable Use In Combat , Display Status Effect , Duration Overrides , Duration Scale Factor , Equip Ability , Is Mount Consumable , Max Duration Modifier , Max Potency Modifier , Min Duration Modifier , Min Potency Modifier , On Use Affliction , Potency Scale Factor , Remove Status Effect Categories , Remove Status Effects , Required Inactive Loot Limit Id , Required Item Class , Shared Cooldown Loc String , Stat Multipliers , Status Effect Mod , Use Count , Weapon Use Count

wszystkie funkcje itd które są w /items mają być dodane do nowej zakładki /faktoria + nowe kolumny

### ***Etap 2***###

Wysyłanie plików do app
w zakładce /preferences jest moduł do importu plików z cenami ale, można dodać tylko 1 plik, app zapisuje tylko price z tego pliku, przy dodaniu następnego pliku price jest nadpisywana

a ma być:

dodanie kilku/kilkudziesięciu plików json z dużą ilością wierszy
każdego dnia dochodzą 2 pliki z danymi cen 
2025-09-17_Aries-Aukcje.json oraz 2025-09-17_Aries-Kupno.json, przedrostek "2025-09-17_" odróżnikiem plików.

dane z plików muszą być zapisywane aby tworzyć bazę danych i korzystać z niej w zakładce /faktoria oraz na późniejszym etapie /karta
sposób wgrywania i tworzenia bazy zostawiam wam, najawązniejsze żeby było to efektywne i stabilne oraz gotowe na dużą ilość danych które będą mogły być szybko przetważane w app

Do przejżenia
"D:\NW_F-aktoria_App3\nw-buddy\nw-buddy\data-ai" tu znajdziesz info na temat projektu
przydatne też będą 
"D:\NW_F-aktoria_App3\nw-buddy\nw-buddy\libs"
"D:\NW_F-aktoria_App3\nw-buddy\nw-buddy\docs"
oraz pliki w głównym folderze



wytyczne dla agenta ai
używamy w komunikacji j. polski
po każdej wprowadzonej funkcji przeprowadzaj testy, im częściej tym lepiej
jeżeli czegoś nie wiesz, zapytaj zanim zaczniesz szukać sam
przy błędach sprawdzaj wszystkie pliki które mogą mieć styczność z tym błędem
przy wprowadzaniu zmiany w pliku staraj się sprawdzić czy nie ma jakiegoś powiązania w innych plikach i trzeba to też tam zmienić
na moją prośbę zawsze rób raport z planu ogólnego, z tego co jest zrobione i z tego co jest do zrobienia, dodaj też info o napotkanych błędach i krótkie info o ich rozwiązaniu


przydatne linki
https://github.com/bic111games-ai/nw-buddy
https://github.com/giniedp/nw-buddy
https://github.com/giniedp/nw-buddy-data

























