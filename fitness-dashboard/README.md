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

Nie potrzeba Node.js ani lokalnego Gita. Projekt musi znajdować się w katalogu głównym repozytorium: plik `index.html` obok folderów `css`, `js` i `.github`.

1. Na GitHub utwórz publiczne repozytorium, np. `fitness-dashboard`.
2. Przez **Add file → Upload files** wgraj zawartość folderu `fitness-dashboard`, nie sam folder nadrzędny. Zatwierdź pliki w gałęzi `main`.
3. Najprostsza publikacja: **Settings → Pages → Build and deployment → Deploy from a branch**, gałąź **main**, folder **/(root)**, następnie **Save**.
4. Po ukończeniu wdrożenia adres pojawi się w **Settings → Pages**. Zwykle ma postać `https://TWOJ-LOGIN.github.io/fitness-dashboard/`.

Alternatywnie wybierz **GitHub Actions** jako źródło Pages. Dołączony `.github/workflows/pages.yml` wdraża stronę po zmianach w `main` lub po ręcznym uruchomieniu. Workflow musi być wgrany także wtedy, gdy system ukrywa folder `.github`. Wybierz tylko jeden sposób publikacji.

Jeśli umieścisz projekt jako podfolder większego repozytorium, przenieś workflow do głównego `.github/workflows` i zmień `path: .` w kroku upload na `path: fitness-dashboard`.

## Prywatność i kopie danych

Strona jest publiczna, ale wpisy są prywatne dla danej przeglądarki. Dane są przechowywane w `localStorage` pod kluczem `fitnessEntries`. Nie są wysyłane do GitHuba ani do innego serwera. Dostawcy czcionek, ikon i zdjęcia otrzymują standardowe żądania pobrania tych zasobów, bez wpisów dziennika.

**GitHub Pages nie synchronizuje danych pomiędzy urządzeniami.** Do przenoszenia historii służy eksport i import. Wyczyszczenie danych witryny lub używanie trybu prywatnego może usunąć historię. Dane otwartego lokalnie pliku nie przenoszą się automatycznie pod adres GitHub Pages: najpierw je wyeksportuj, a potem zaimportuj na opublikowanej stronie. Nie umieszczaj kopii JSON z prywatnymi wpisami w publicznym repozytorium.

Synchronizacja i publikowanie wspólnej historii wymagają osobnego backendu z uwierzytelnianiem; nie są częścią tej statycznej wersji.

## Pliki aplikacji

`index.html`, trzy arkusze w `css/`, `js/storage.js` (walidacja i pamięć) oraz `js/app.js` (interakcje, kalendarz i obliczenia). Pozostałe pliki z początkowego szablonu nie są ładowane; aplikacja nie pobiera przykładowych danych.