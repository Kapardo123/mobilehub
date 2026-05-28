CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN CREATE TYPE user_role AS ENUM ('owner', 'employee', 'admin'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE product_status AS ENUM ('nowy', 'uzywany', 'sprzedany', 'zablokowany'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE product_category AS ENUM ('telefon', 'akcesoria', 'usluga', 'serwis'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE payment_method AS ENUM ('gotowka', 'karta', 'przelew', 'blik'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE cost_category AS ENUM ('skup', 'zaliczka', 'paczki', 'gotowka', 'inne'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE tax_type AS ENUM ('VAT', 'marza', 'zwolniony'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE invoice_status AS ENUM ('szkic', 'wydana', 'oplacona', 'anulowana'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE action_type AS ENUM ('sprzedaz', 'przyjecie', 'serwis', 'edycja', 'logowanie', 'wylogowanie', 'inna', 'koszt', 'dodanie_produktu', 'usuniecie_produktu', 'edycja_produktu', 'generowanie_faktury', 'zmiana_statusu'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE shift_status AS ENUM ('planowany', 'potwierdzony', 'zrealizowany', 'anulowany'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE document_type AS ENUM ('faktura', 'umowa', 'raport', 'cennik', 'inny'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    initials VARCHAR(10) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    login VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    role user_role NOT NULL DEFAULT 'employee',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_users_login ON public.users(login);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);

CREATE TABLE public.shops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    phone VARCHAR(20),
    email VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    config JSONB DEFAULT '{}'
);

CREATE INDEX idx_shops_code ON public.shops(code);
CREATE INDEX idx_shops_name ON public.shops(name);

CREATE TABLE public.user_shops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    unassigned_at TIMESTAMPTZ,
    UNIQUE(user_id, shop_id, unassigned_at)
);

CREATE INDEX idx_user_shops_user_id ON public.user_shops(user_id);
CREATE INDEX idx_user_shops_shop_id ON public.user_shops(shop_id);

CREATE TABLE public.inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku VARCHAR(50) UNIQUE,
    name VARCHAR(255) NOT NULL,
    category product_category NOT NULL DEFAULT 'telefon',
    brand VARCHAR(100),
    model VARCHAR(100),
    memory VARCHAR(50),
    color VARCHAR(100),
    condition product_status NOT NULL DEFAULT 'uzywany',
    battery_health VARCHAR(20),
    imei VARCHAR(30) UNIQUE,
    purchase_price DECIMAL(12, 2),
    selling_price DECIMAL(12, 2),
    profit_margin DECIMAL(12, 2),
    tax_type tax_type NOT NULL DEFAULT 'marza',
    stock_quantity INTEGER NOT NULL DEFAULT 1 CHECK (stock_quantity >= 0),
    stock_alert_threshold INTEGER DEFAULT 1,
    is_low_stock BOOLEAN GENERATED ALWAYS AS (stock_quantity <= stock_alert_threshold) STORED,
    status product_status NOT NULL DEFAULT 'nowy',
    is_sold BOOLEAN NOT NULL DEFAULT false,
    sold_at TIMESTAMPTZ,
    warranty_months INTEGER,
    warranty_until DATE,
    set_includes TEXT,
    purchase_date DATE,
    selling_date DATE,
    notes TEXT,
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE RESTRICT,
    added_by UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_inventory_sku ON public.inventory(sku);
CREATE INDEX idx_inventory_imei ON public.inventory(imei) WHERE imei IS NOT NULL;
CREATE INDEX idx_inventory_category ON public.inventory(category);
CREATE INDEX idx_inventory_brand_model ON public.inventory(brand, model);
CREATE INDEX idx_inventory_shop_id ON public.inventory(shop_id);
CREATE INDEX idx_inventory_added_by ON public.inventory(added_by);
CREATE INDEX idx_inventory_status ON public.inventory(status);
CREATE INDEX idx_inventory_low_stock ON public.inventory(is_low_stock) WHERE is_low_stock = true;

CREATE OR REPLACE FUNCTION public.update_profit_margin()
RETURNS TRIGGER AS $$
BEGIN
    NEW.profit_margin := NEW.selling_price - NEW.purchase_price;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_profit_margin
    BEFORE INSERT OR UPDATE OF purchase_price, selling_price ON public.inventory
    FOR EACH ROW EXECUTE FUNCTION public.update_profit_margin();

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_inventory_updated_at
    BEFORE UPDATE ON public.inventory FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_type VARCHAR(20) NOT NULL DEFAULT 'individual' CHECK (customer_type IN ('individual', 'company')),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company_name VARCHAR(200),
    nip VARCHAR(13),
    regon VARCHAR(14),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    email VARCHAR(255),
    phone VARCHAR(20),
    total_purchases DECIMAL(12, 2) NOT NULL DEFAULT 0,
    purchase_count INTEGER NOT NULL DEFAULT 0,
    last_purchase_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_customers_nip ON public.customers(nip) WHERE nip IS NOT NULL;
CREATE INDEX idx_customers_email ON public.customers(email);
CREATE INDEX idx_customers_name ON public.customers(last_name, first_name);

CREATE TRIGGER trigger_customers_updated_at
    BEFORE UPDATE ON public.customers FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_number VARCHAR(50) UNIQUE NOT NULL,
    sale_date DATE NOT NULL,
    sale_time TIME NOT NULL,
    payment_method payment_method NOT NULL DEFAULT 'gotowka',
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
    total_profit DECIMAL(12, 2) NOT NULL DEFAULT 0,
    total_cost DECIMAL(12, 2) NOT NULL DEFAULT 0,
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE RESTRICT,
    employee_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    invoice_id UUID UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'cancelled', 'refunded')),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_sales_sale_number ON public.sales(sale_number);
CREATE INDEX idx_sales_date ON public.sales(sale_date DESC);
CREATE INDEX idx_sales_payment_method ON public.sales(payment_method);
CREATE INDEX idx_sales_shop_employee_date ON public.sales(shop_id, employee_id, sale_date DESC);

CREATE TRIGGER trigger_sales_updated_at
    BEFORE UPDATE ON public.sales FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.generate_sale_number()
RETURNS TRIGGER AS $$
DECLARE prefix TEXT; seq_num INTEGER;
BEGIN
    prefix := 'FS-' || TO_CHAR(NEW.sale_date, 'YYYY') || '-';
    SELECT COALESCE(MAX(SUBSTRING(sale_number FROM '[0-9]+$')::INTEGER), 0) + 1 INTO seq_num
    FROM public.sales WHERE sale_date = NEW.sale_date;
    NEW.sale_number := prefix || LPAD(seq_num::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_sale_number
    BEFORE INSERT ON public.sales FOR EACH ROW
    EXECUTE FUNCTION public.generate_sale_number();

CREATE TABLE public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE,
    sale_date DATE NOT NULL,
    sale_time TIME NOT NULL,
    status invoice_status NOT NULL DEFAULT 'szkic',
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    net_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    vat_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE RESTRICT,
    employee_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    sale_id UUID UNIQUE,
    notes TEXT,
    internal_notes TEXT,
    pdf_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    issued_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_invoices_number ON public.invoices(invoice_number);
CREATE INDEX idx_invoices_date ON public.invoices(issue_date DESC);
CREATE INDEX idx_invoices_customer ON public.invoices(customer_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);

CREATE TRIGGER trigger_invoices_updated_at
    BEFORE UPDATE ON public.invoices FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE prefix TEXT; seq_num INTEGER;
BEGIN
    prefix := 'FV-' || TO_CHAR(NEW.issue_date, 'YYYY') || '-';
    SELECT COALESCE(MAX(SUBSTRING(invoice_number FROM '[0-9]+$')::INTEGER), 0) + 1 INTO seq_num
    FROM public.invoices WHERE issue_date = NEW.issue_date;
    NEW.invoice_number := prefix || LPAD(seq_num::TEXT, 5, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_invoice_number
    BEFORE INSERT ON public.invoices FOR EACH ROW
    EXECUTE FUNCTION public.generate_invoice_number();

ALTER TABLE public.sales ADD CONSTRAINT fk_sales_invoice FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE SET NULL;

ALTER TABLE public.invoices ADD CONSTRAINT fk_invoices_sale FOREIGN KEY (sale_id) REFERENCES public.sales(id) ON DELETE SET NULL;

CREATE TABLE public.sale_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    category product_category NOT NULL,
    inventory_id UUID REFERENCES public.inventory(id) ON DELETE SET NULL,
    unit_price DECIMAL(12, 2) NOT NULL CHECK (unit_price >= 0),
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    total_price DECIMAL(12, 2) GENERATED ALWAYS AS (unit_price * quantity) STORED,
    purchase_cost DECIMAL(12, 2) DEFAULT 0,
    profit DECIMAL(12, 2) GENERATED ALWAYS AS (unit_price * quantity - purchase_cost * quantity) STORED,
    imei VARCHAR(30),
    tax_type tax_type NOT NULL DEFAULT 'marza',
    comment TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sale_items_sale_id ON public.sale_items(sale_id);
CREATE INDEX idx_sale_items_inventory_id ON public.sale_items(inventory_id) WHERE inventory_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.update_sale_totals()
RETURNS TRIGGER AS $$
DECLARE v_total DECIMAL; v_profit DECIMAL; v_cost DECIMAL;
BEGIN
    SELECT COALESCE(SUM(total_price), 0), COALESCE(SUM(profit), 0), COALESCE(SUM(purchase_cost * quantity), 0)
    INTO v_total, v_profit, v_cost
    FROM public.sale_items WHERE sale_id = COALESCE(NEW.sale_id, OLD.sale_id);
    
    UPDATE public.sales SET total_amount = v_total, total_profit = v_profit, total_cost = v_cost, updated_at = NOW()
    WHERE id = COALESCE(NEW.sale_id, OLD.sale_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_sale_totals
    AFTER INSERT OR UPDATE OR DELETE ON public.sale_items FOR EACH ROW
    EXECUTE FUNCTION public.update_sale_totals();

CREATE TABLE public.invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    item_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    unit_price DECIMAL(12, 2) NOT NULL CHECK (unit_price >= 0),
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_net_price DECIMAL(12, 2),
    vat_rate DECIMAL(5, 2) DEFAULT 23.00,
    total_gross DECIMAL(12, 2) GENERATED ALWAYS AS (unit_price * quantity) STORED,
    total_net DECIMAL(12, 2) GENERATED ALWAYS AS (COALESCE(unit_net_price, unit_price) * quantity) STORED,
    total_vat DECIMAL(12, 2) GENERATED ALWAYS AS ((unit_price * quantity) - (COALESCE(unit_net_price, unit_price) * quantity)) STORED,
    sale_item_id UUID REFERENCES public.sale_items(id) ON DELETE SET NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invoice_items_invoice_id ON public.invoice_items(invoice_id);

CREATE OR REPLACE FUNCTION public.update_invoice_totals()
RETURNS TRIGGER AS $$
DECLARE v_gross DECIMAL; v_net DECIMAL; v_vat DECIMAL;
BEGIN
    SELECT COALESCE(SUM(total_gross), 0), COALESCE(SUM(total_net), 0), COALESCE(SUM(total_vat), 0)
    INTO v_gross, v_net, v_vat
    FROM public.invoice_items WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id);
    
    UPDATE public.invoices SET total_amount = v_gross, net_amount = v_net, vat_amount = v_vat, updated_at = NOW()
    WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_invoice_totals
    AFTER INSERT OR UPDATE OR DELETE ON public.invoice_items FOR EACH ROW
    EXECUTE FUNCTION public.update_invoice_totals();

CREATE TABLE public.costs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cost_date DATE NOT NULL,
    cost_time TIME NOT NULL,
    category cost_category NOT NULL,
    amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
    description TEXT NOT NULL,
    payment_method payment_method DEFAULT 'gotowka',
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE RESTRICT,
    employee_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    related_purchase_id UUID,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    verified_by UUID REFERENCES public.users(id),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_costs_date_cat ON public.costs(cost_date DESC, category);
CREATE INDEX idx_costs_shop_date ON public.costs(shop_id, cost_date DESC);
CREATE INDEX idx_costs_unverified ON public.costs(is_verified) WHERE is_verified = false;

CREATE TRIGGER trigger_costs_updated_at
    BEFORE UPDATE ON public.costs FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shift_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    break_start TIME,
    break_end TIME,
    break_duration_minutes INTEGER DEFAULT 0,
    total_hours DECIMAL(4, 2) GENERATED ALWAYS AS (
        EXTRACT(EPOCH FROM (end_time - start_time)) / 3600 - (break_duration_minutes / 60.0)
    ) STORED,
    status shift_status NOT NULL DEFAULT 'planowany',
    shift_type VARCHAR(50),
    preset_name VARCHAR(50),
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE RESTRICT,
    employee_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    notes TEXT,
    confirmed_by UUID REFERENCES public.users(id),
    confirmed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_shifts_emp_date ON public.shifts(employee_id, shift_date);
CREATE INDEX idx_shifts_shop_date ON public.shifts(shop_id, shift_date);

CREATE TRIGGER trigger_shifts_updated_at
    BEFORE UPDATE ON public.shifts FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action_type action_type NOT NULL,
    description TEXT NOT NULL,
    details TEXT,
    actor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    actor_name VARCHAR(255),
    shop_id UUID REFERENCES public.shops(id) ON DELETE SET NULL,
    shop_name VARCHAR(200),
    target_table VARCHAR(100),
    target_id UUID,
    target_type VARCHAR(100),
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_log_type ON public.audit_log(action_type);
CREATE INDEX idx_audit_log_actor ON public.audit_log(actor_id);
CREATE INDEX idx_audit_log_created ON public.audit_log(created_at DESC);
CREATE INDEX idx_audit_log_target ON public.audit_log(target_table, target_id);

CREATE TABLE public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename VARCHAR(500) NOT NULL,
    original_filename VARCHAR(500),
    document_type document_type NOT NULL DEFAULT 'inny',
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100),
    storage_path TEXT NOT NULL,
    url TEXT,
    description TEXT,
    tags TEXT[],
    uploaded_by UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    shop_id UUID REFERENCES public.shops(id) ON DELETE SET NULL,
    related_entity_type VARCHAR(50),
    related_entity_id UUID,
    is_public BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_documents_type ON public.documents(document_type);
CREATE INDEX idx_documents_uploader ON public.documents(uploaded_by);
CREATE INDEX idx_documents_tags ON public.documents USING GIN(tags);

CREATE TRIGGER trigger_documents_updated_at
    BEFORE UPDATE ON public.documents FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.daily_cash_summary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    summary_date DATE NOT NULL,
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE RESTRICT,
    opening_balance DECIMAL(12, 2) NOT NULL DEFAULT 0,
    closing_balance DECIMAL(12, 2),
    cash_sales DECIMAL(12, 2) NOT NULL DEFAULT 0,
    card_sales DECIMAL(12, 2) NOT NULL DEFAULT 0,
    total_sales DECIMAL(12, 2) NOT NULL DEFAULT 0,
    cash_topups DECIMAL(12, 2) NOT NULL DEFAULT 0,
    total_costs DECIMAL(12, 2) NOT NULL DEFAULT 0,
    net_profit DECIMAL(12, 2) NOT NULL DEFAULT 0,
    transactions_count INTEGER NOT NULL DEFAULT 0,
    items_sold INTEGER NOT NULL DEFAULT 0,
    is_closed BOOLEAN NOT NULL DEFAULT false,
    closed_by UUID REFERENCES public.users(id),
    closed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(shop_id, summary_date)
);

CREATE INDEX idx_daily_cash_date ON public.daily_cash_summary(summary_date DESC);
CREATE INDEX idx_daily_cash_shop ON public.daily_cash_summary(shop_id);

CREATE TRIGGER trigger_daily_cash_updated_at
    BEFORE UPDATE ON public.daily_cash_summary FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'info' CHECK (type IN ('info','success','warning','error')),
    is_read BOOLEAN NOT NULL DEFAULT false,
    read_at TIMESTAMPTZ,
    action_url TEXT,
    action_label VARCHAR(100),
    related_entity_type VARCHAR(50),
    related_entity_id UUID,
    priority INTEGER NOT NULL DEFAULT 0,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX notifications_user_unread ON public.notifications(user_id, is_read) WHERE is_read = false;

CREATE TABLE public.user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    device_info TEXT,
    ip_address INET,
    user_agent TEXT,
    active_shop_id UUID REFERENCES public.shops(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
    logged_out_at TIMESTAMPTZ,
    logout_reason VARCHAR(100)
);

CREATE INDEX idx_sessions_active ON public.user_sessions(user_id, is_active) WHERE is_active = true;

CREATE TABLE public.system_config (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by UUID REFERENCES public.users(id)
);

CREATE TRIGGER trigger_system_config_updated_at
    BEFORE UPDATE ON public.system_config FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.system_config (key, value, description) VALUES
('default_opening_balance', '2698', 'Domyslny stan kasy'),
('max_concurrent_sessions', '3', 'Max sesji rownoleglych'),
('company_name', '"SWIAT GSM - MOBILE HUB"', 'Nazwa firmy'),
('company_address', '"ul. Stawowa 1, 40-095 Katowice"', 'Adres firmy'),
('company_nip', '"123-456-78-90"', 'NIP firmy'),
('company_bank', '"Bank PKO BP"', 'Bank'),
('company_account', '"12 3456 7890 0000 0000 1234 5678"', 'Konto bankowe'),
('currency_symbol', '"zl"', 'Symbol waluty'),
('low_stock_threshold', '1', 'Prog alertu magazynowego'),
('session_timeout_hours', '24', 'Timeout sesji');
