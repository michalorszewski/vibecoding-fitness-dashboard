# Forma | Dziennik aktywności

Statyczny dashboard po polsku: treningi, jedzenie i miesięczne postępy. Ciemny motyw, czcionka Poppins, układ na komputer i telefon. Bez instalowania pakietów, konta ani serwera aplikacji.

## Uruchomienie

Otwórz `index.html` w przeglądarce. Strona działa bez budowania projektu. Dostęp do internetu jest potrzebny do pobrania Poppins, ikon Lucide i zdjęcia z Unsplash.

## Korzystanie

- Wybierz dzień w kalendarzu lub „Uzupełnij dziś”. Przyszłe dni są zablokowane.
- Zaznacz trening albo odpoczynek oraz jedzenie: zdrowo, różnie lub niezdrowo.
- Przy treningu możesz wybrać aktywność i podać liczbę minut. Notatka jest opcjonalna.
- Kliknij „Zapisz dzień”. Wpis można później edytować lub usunąć.
- Strzałki zmieniają miesiąc. „Dzisiaj” wraca do bieżącego dnia.
- „Eksportuj dane” pobiera kopię JSON. „Importuj” scala ją z obecną historią, zastępując wpisy z tych samych dni dopiero po potwierdzeniu.

## Podsumowania

- Treningi: liczba dni z treningiem i łączny zapisany czas aktywności.
- Zdrowe jedzenie: liczba zdrowych dni i ich udział w dniach z wpisem. Brak wpisu nie jest traktowany jako niezdrowy dzień.
- Najdłuższa seria: kolejne dni z treningiem lub zdrowym jedzeniem, w wybranym miesiącu. Brak wpisu przerywa serię.
- Uzupełnione dni: wpisy względem liczby minionych dni miesiąca. Dla wcześniejszych miesięcy względem całego miesiąca.
- Wykres: liczba treningów i zdrowych dni w tygodniach od poniedziałku do niedzieli; pierwszy i ostatni tydzień mogą być niepełne.

## Publikacja na GitHub Pages

Repozytorium trzyma aplikację w folderze `fitness-dashboard/`. Workflow w głównym `.github/workflows/pages.yml` publikuje zawartość tego folderu po każdym pushu do `main`. Nie wymaga Node.js ani etapu budowania.

1. W repozytorium otwórz **Settings → Pages**.
2. W sekcji **Build and deployment** wybierz **GitHub Actions** jako źródło.
3. Zatwierdź i wypchnij zmiany do `main`. Przebieg wdrożenia sprawdzisz na karcie **Actions**.
4. Po udanym wdrożeniu adres strony pojawi się w **Settings → Pages**. Zwykle ma postać `https://TWOJ-LOGIN.github.io/NAZWA-REPO/`.

Workflow nie publikuje `data/entries.json`, czyli przykładowego pliku danych z szablonu. GitHub Pages wymaga odpowiedniego planu dla repozytorium prywatnego; jeśli konfiguracja lub wdrożenie zgłosi problem z dostępnością Pages, sprawdź ustawienia widoczności repozytorium i plan konta. Ten workflow nie zmienia widoczności repozytorium.

## Prywatność i kopie danych

Strona jest publiczna, ale wpisy są prywatne dla danej przeglądarki. Dane są przechowywane w `localStorage` pod kluczem `fitnessEntries`. Nie są wysyłane do GitHuba ani do innego serwera. Dostawcy czcionek, ikon i zdjęcia otrzymują standardowe żądania pobrania tych zasobów, bez wpisów dziennika.

**GitHub Pages nie synchronizuje danych pomiędzy urządzeniami.** Do przenoszenia historii służy eksport i import. Wyczyszczenie danych witryny lub używanie trybu prywatnego może usunąć historię. Dane otwartego lokalnie pliku nie przenoszą się automatycznie pod adres GitHub Pages: najpierw je wyeksportuj, a potem zaimportuj na opublikowanej stronie. Nie umieszczaj kopii JSON z prywatnymi wpisami w publicznym repozytorium.

Synchronizacja i publikowanie wspólnej historii wymagają osobnego backendu z uwierzytelnianiem; nie są częścią tej statycznej wersji.

## Pliki aplikacji

`index.html`, trzy arkusze w `css/`, `js/storage.js` (walidacja i pamięć) oraz `js/app.js` (interakcje, kalendarz i obliczenia). Pozostałe pliki z początkowego szablonu nie są ładowane; aplikacja nie pobiera przykładowych danych.