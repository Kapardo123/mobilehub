-- Shop Access Logs - Tabela do zarządzania dostępem do sklepów
-- Autor: System MobileHub
-- Data: 2026-05-26

-- 1. Główna tabela logów dostępu do sklepów
CREATE TABLE IF NOT EXISTS shop_access_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Informacje o sklepie
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    shop_name TEXT NOT NULL,
    
    -- Informacje o użytkowniku
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    user_role TEXT NOT NULL CHECK (user_role IN ('owner', 'employee', 'admin')),
    
    -- Akcja wykonana na sklepie
    action TEXT NOT NULL CHECK (action IN ('login', 'logout', 'block', 'unblock')),
    
    -- Zmiana statusu
    previous_status TEXT NOT NULL CHECK (previous_status IN ('available', 'occupied')),
    new_status TEXT NOT NULL CHECK (new_status IN ('available', 'occupied')),
    
    -- Timestamp i sesja
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    session_id TEXT,
    
    -- Dodatkowe metadane (JSON)
    metadata JSONB DEFAULT '{}',
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Indeksy dla wydajności
CREATE INDEX IF NOT EXISTS idx_shop_access_logs_shop_id ON shop_access_logs(shop_id);
CREATE INDEX IF NOT EXISTS idx_shop_access_logs_user_id ON shop_access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_shop_access_logs_timestamp ON shop_access_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_shop_access_logs_action ON shop_access_logs(action);
CREATE INDEX IF NOT EXISTS idx_shop_access_logs_session_id ON shop_access_logs(session_id);

-- 3. Indeks złożony dla częstych zapytań
CREATE INDEX IF NOT EXISTS idx_shop_access_logs_shop_timestamp 
    ON shop_access_logs(shop_id, timestamp DESC);

-- 4. RLS (Row Level Security) - Zabezpieczenie na poziomie wierszy
ALTER TABLE shop_access_logs ENABLE ROW LEVEL SECURITY;

-- Polityka RLS: Właściciele i admini widzą wszystkie logi
CREATE POLICY "Owners_and_admins_can_view_all_logs" ON shop_access_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('owner', 'admin')
        )
    );

-- Polityka RLS: Pracownicy widzą tylko logi swoich sklepów
CREATE POLICY "Employees_can_view_their_shop_logs" ON shop_access_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_shops 
            WHERE user_shops.user_id = auth.uid() 
            AND user_shops.shop_id = shop_access_logs.shop_id
        )
    );

-- Polityka RLS: System może dodawać logy (dla serwisu)
CREATE POLICY "Service_can_insert_logs" ON shop_access_logs
    FOR INSERT WITH CHECK (true);

-- 5. Trigger do automatycznej aktualizacji updated_at
CREATE OR REPLACE FUNCTION update_shop_access_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_shop_access_logs_updated_at ON shop_access_logs;
CREATE TRIGGER trigger_shop_access_logs_updated_at
    BEFORE UPDATE ON shop_access_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_shop_access_logs_updated_at();

-- 6. Funkcja pomocnicza: Pobierz aktualny status sklepu
CREATE OR REPLACE FUNCTION get_current_shop_status(p_shop_id UUID)
RETURNS TABLE (
    shop_id UUID,
    shop_name TEXT,
    is_available BOOLEAN,
    occupied_by_user_id UUID,
    occupied_by_user_name TEXT,
    occupied_since TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sal.shop_id,
        sal.shop_name,
        (sal.new_status = 'available') AS is_available,
        CASE WHEN sal.new_status = 'occupied' THEN sal.user_id END AS occupied_by_user_id,
        CASE WHEN sal.new_status = 'occupied' THEN sal.user_name END AS occupied_by_user_name,
        CASE WHEN sal.new_status = 'occupied' THEN sal.timestamp END AS occupied_since
    FROM shop_access_logs sal
    WHERE sal.shop_id = p_shop_id
    ORDER BY sal.timestamp DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE;

-- 7. Funkcja pomocnicza: Sprawdź czy sklep jest dostępny
CREATE OR REPLACE FUNCTION is_shop_available(p_shop_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_status TEXT;
BEGIN
    SELECT new_status INTO v_status
    FROM shop_access_logs
    WHERE shop_id = p_shop_id
    ORDER BY timestamp DESC
    LIMIT 1;
    
    RETURN COALESCE(v_status, 'available') = 'available';
END;
$$ LANGUAGE plpgsql STABLE;

-- 8. Widok: Podsumowanie statusu wszystkich sklepów
CREATE OR REPLACE VIEW vw_shop_access_summary AS
SELECT 
    s.id AS shop_id,
    s.name AS shop_name,
    s.code AS shop_code,
    COALESCE(latest.new_status, 'available') AS current_status,
    latest.user_id AS occupied_by_user_id,
    latest.user_name AS occupied_by_user_name,
    latest.timestamp AS status_since,
    latest.session_id,
    (
        SELECT COUNT(*) 
        FROM shop_access_logs l2 
        WHERE l2.shop_id = s.id 
        AND l2.action = 'login'
        AND DATE(l2.timestamp) = CURRENT_DATE
    ) AS login_count_today,
    (
        SELECT COUNT(*) 
        FROM shop_access_logs l3 
        WHERE l3.shop_id = s.id 
        AND DATE(l3.timestamp) = CURRENT_DATE
    ) AS total_actions_today
FROM shops s
LEFT JOIN LATERAL (
    SELECT *
    FROM shop_access_logs
    WHERE shop_id = s.id
    ORDER BY timestamp DESC
    LIMIT 1
) latest ON true
WHERE s.is_active = true
AND s.deleted_at IS NULL;

-- 9. Komentarze dokumentujące
COMMENT ON TABLE shop_access_logs IS 'Logi zarządzania dostępem do sklepów - śledzi kto i kiedy zablokował/odblokował sklep';
COMMENT ON COLUMN shop_access_logs.id IS 'Unikalny identyfikator rekordu';
COMMENT ON COLUMN shop_access_logs.shop_id IS 'ID sklepu (FK do shops)';
COMMENT ON COLUMN shop_access_logs.shop_name IS 'Nazwa sklepu (denormalizowana dla wydajności)';
COMMENT ON COLUMN shop_access_logs.user_id IS 'ID użytkownika (FK do users)';
COMMENT ON COLUMN shop_access_logs.user_name IS 'Nazwa użytkownika (denormalizowana)';
COMMENT ON COLUMN shop_access_logs.user_role IS 'Rola użytkownika: owner/employee/admin';
COMMENT ON COLUMN shop_access_logs.action IS 'Typ akcji: login/logout/block/unblock';
COMMENT ON COLUMN shop_access_logs.previous_status IS 'Status przed zmianą: available/occupied';
COMMENT ON COLUMN shop_access_logs.new_status IS 'Status po zmianie: available/occupied';
COMMENT ON COLUMN shop_access_logs.timestamp IS 'Moment wykonania akcji';
COMMENT ON COLUMN shop_access_logs.session_id IS 'ID sesji użytkownika (do śledzenia sesji)';
COMMENT ON COLUMN shop_access_logs.metadata IS 'Dodatkowe dane w formacie JSON';

COMMENT ON VIEW vw_shop_access_summary IS 'Widok podsumowujący aktualny status wszystkich aktywnych sklepów';
COMMENT ON FUNCTION get_current_shop_status IS 'Pobiera ostatni status danego sklepu';
COMMENT ON FUNCTION is_shop_available IS 'Sprawdza czy dany sklep jest obecnie dostępny';

-- 10. Przykładowe zapytania (jako komentarze)

/*
-- Pobierz wszystkie zablokowane sklepy
SELECT * FROM vw_shop_access_summary 
WHERE current_status = 'occupied'
ORDER BY status_since DESC;

-- Pobierz historię logów dla konkretnego sklepu
SELECT * FROM shop_access_logs 
WHERE shop_id = 'UUID-SKLEPU'
ORDER BY timestamp DESC 
LIMIT 50;

-- Pobierz aktywność dzisiejszą
SELECT * FROM shop_access_logs 
WHERE DATE(timestamp) = CURRENT_DATE
ORDER BY timestamp DESC;

-- Statystyki użycia sklepów (ostatnie 30 dni)
SELECT 
    shop_name,
    COUNT(*) FILTER (WHERE action = 'login') as logins,
    COUNT(*) FILTER (WHERE action = 'logout') as logouts,
    COUNT(DISTINCT user_id) as unique_users
FROM shop_access_logs
WHERE timestamp >= NOW() - INTERVAL '30 days'
GROUP BY shop_name
ORDER BY logins DESC;
*/

DO $$
BEGIN
    RAISE NOTICE '✅ Tabela shop_access_logs została utworzona pomyślnie!';
    RAISE NOTICE '✅ Widok vw_shop_access_summary jest gotowy';
    RAISE NOTICE '✅ Funkcje pomocnicze: get_current_shop_status(), is_shop_available()';
END $$;
