-- Usuń wszystkie dane z magazynu oprócz telefonów (soft delete - ustawia deleted_at)
UPDATE public.inventory
SET deleted_at = NOW()
WHERE category != 'telefon'
AND deleted_at IS NULL;

-- Sprawdź, ile elementów zostało usuniętych
SELECT COUNT(*) AS usuniete_elementy
FROM public.inventory
WHERE category != 'telefon'
AND deleted_at IS NOT NULL;

-- Sprawdź, ile telefonów pozostało
SELECT COUNT(*) AS pozostale_telefony
FROM public.inventory
WHERE category = 'telefon'
AND deleted_at IS NULL;
