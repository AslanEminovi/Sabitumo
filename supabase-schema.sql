-- Enable UUID extension
CREATE EXTENSION
IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE users
(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) NOT NULL DEFAULT 'Georgia',
    language VARCHAR(2) NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'ka')),
    created_at TIMESTAMP
    WITH TIME ZONE DEFAULT NOW
    (),
  updated_at TIMESTAMP
    WITH TIME ZONE DEFAULT NOW
    ()
);

    -- Create categories table
    CREATE TABLE categories
    (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name_en VARCHAR(100) NOT NULL,
        name_ka VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        description_en TEXT,
        description_ka TEXT,
        image VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP
        WITH TIME ZONE DEFAULT NOW
        ()
);

        -- Create products table
        CREATE TABLE products
        (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name_en VARCHAR(255) NOT NULL,
            name_ka VARCHAR(255) NOT NULL,
            description_en TEXT NOT NULL,
            description_ka TEXT NOT NULL,
            price DECIMAL(10,2) NOT NULL,
            currency VARCHAR(3) NOT NULL DEFAULT 'GEL',
            category_id UUID REFERENCES categories(id),
            subcategory VARCHAR(100),
            images TEXT
            [] DEFAULT '{}',
  stock INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP
            WITH TIME ZONE DEFAULT NOW
            (),
  updated_at TIMESTAMP
            WITH TIME ZONE DEFAULT NOW
            ()
);

            -- Create orders table
            CREATE TABLE orders
            (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID REFERENCES users(id),
                status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
                total_amount DECIMAL(10,2) NOT NULL,
                currency VARCHAR(3) NOT NULL DEFAULT 'GEL',
                shipping_address TEXT NOT NULL,
                shipping_city VARCHAR(100) NOT NULL,
                shipping_postal_code VARCHAR(20) NOT NULL,
                shipping_country VARCHAR(100) NOT NULL DEFAULT 'Georgia',
                payment_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
                stripe_payment_intent_id VARCHAR(255),
                created_at TIMESTAMP
                WITH TIME ZONE DEFAULT NOW
                (),
  updated_at TIMESTAMP
                WITH TIME ZONE DEFAULT NOW
                ()
);

                -- Create order_items table
                CREATE TABLE order_items
                (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
                    product_id UUID REFERENCES products(id),
                    quantity INTEGER NOT NULL,
                    unit_price DECIMAL(10,2) NOT NULL,
                    total_price DECIMAL(10,2) NOT NULL
                );

                -- Create indexes for better performance
                CREATE INDEX idx_products_category ON products(category_id);
                CREATE INDEX idx_products_active ON products(is_active);
                CREATE INDEX idx_orders_user ON orders(user_id);
                CREATE INDEX idx_orders_status ON orders(status);
                CREATE INDEX idx_order_items_order ON order_items(order_id);

                -- Create updated_at trigger function
                CREATE OR REPLACE FUNCTION update_updated_at_column
                ()
RETURNS TRIGGER AS $$
                BEGIN
  NEW.updated_at = NOW
                ();
                RETURN NEW;
                END;
$$ language 'plpgsql';

                -- Create triggers for updated_at
                CREATE TRIGGER update_users_updated_at BEFORE
                UPDATE ON users FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column
                ();
                CREATE TRIGGER update_products_updated_at BEFORE
                UPDATE ON products FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column
                ();
                CREATE TRIGGER update_orders_updated_at BEFORE
                UPDATE ON orders FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column
                ();

                -- Insert some sample categories
                INSERT INTO categories
                    (name_en, name_ka, slug, description_en, description_ka)
                VALUES
                    ('Knives', 'დანები', 'knives', 'High-quality knives for various purposes', 'სხვადასხვა დანიშნულების მაღალი ხარისხის დანები'),
                    ('Military Equipment', 'სამხედრო აღჭურვილობა', 'military-equipment', 'Professional military and tactical gear', 'პროფესიონალური სამხედრო და ტაქტიკური აღჭურვილობა'),
                    ('Tactical Gear', 'ტაქტიკური აღჭურვილობა', 'tactical-gear', 'Tactical equipment and accessories', 'ტაქტიკური აღჭურვილობა და აქსესუარები'),
                    ('Survival Tools', 'საშუამშვიდობო ხელსაწყოები', 'survival-tools', 'Essential tools for survival situations', 'საშუამშვიდობო სიტუაციებისთვის აუცილებელი ხელსაწყოები');
