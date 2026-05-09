-- 1. Shops (Punkty sprzedaży)
CREATE TABLE shops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Employees (Pracownicy)
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'pracownik', -- 'pracownik', 'kierownik', 'wlasciciel'
  initials TEXT,
  pin TEXT, -- Simple PIN for quick login if needed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Shop Employees (Mapping employees to shops)
CREATE TABLE shop_employees (
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  PRIMARY KEY (shop_id, employee_id)
);

-- 4. Inventory (Magazyn)
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID REFERENCES shops(id),
  item_name TEXT NOT NULL,
  category TEXT, -- 'akcesoria', 'czesci', 'uslugi'
  quantity INTEGER DEFAULT 0,
  price_net DECIMAL(10,2),
  price_gross DECIMAL(10,2),
  low_stock_threshold INTEGER DEFAULT 5,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Phones (Telefony - IMEI tracking)
CREATE TABLE phones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID REFERENCES shops(id),
  model TEXT NOT NULL,
  imei TEXT UNIQUE NOT NULL,
  condition TEXT, -- 'nowy', 'uzywany'
  price_buy DECIMAL(10,2),
  price_sell_target DECIMAL(10,2),
  status TEXT DEFAULT 'w_magazynie', -- 'w_magazynie', 'sprzedany'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Sales (Sprzedaż)
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID REFERENCES shops(id),
  employee_id UUID REFERENCES employees(id),
  total_amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT, -- 'gotowka', 'karta'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Sale Items (Pozycje na paragonie/fakturze)
CREATE TABLE sale_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
  item_type TEXT, -- 'inventory', 'phone'
  item_id UUID, -- Reference to inventory or phones
  description TEXT,
  quantity INTEGER DEFAULT 1,
  price_unit DECIMAL(10,2) NOT NULL
);

-- Seed Data (Initial shops)
-- INSERT INTO shops (name, location) VALUES ('Trzy Stawy', 'Katowice'), ('Galeria Katowicka', 'Katowice'), ('Silesia City Center', 'Katowice');
