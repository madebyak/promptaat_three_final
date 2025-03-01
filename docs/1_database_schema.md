# Promptaat Database Schema

## Main Platform Schema (public)

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    country VARCHAR(100) NOT NULL,
    occupation VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    deleted_at TIMESTAMP WITH TIME ZONE
);
```

### Categories Table
```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID REFERENCES categories(id),
    name_en VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100) NOT NULL,
    icon_name VARCHAR(50),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);
```

### Subcategories Table
```sql
CREATE TABLE subcategories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES categories(id),
    name_en VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100) NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);
```

### Tools Table
```sql
CREATE TABLE tools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    icon_url VARCHAR(255),
    website_url VARCHAR(255),
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);
```

### Prompts Table
```sql
CREATE TABLE prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title_en VARCHAR(255) NOT NULL,
    title_ar VARCHAR(255) NOT NULL,
    description_en TEXT,
    description_ar TEXT,
    prompt_text_en TEXT NOT NULL,
    prompt_text_ar TEXT NOT NULL,
    instruction_en TEXT,
    instruction_ar TEXT,
    is_pro BOOLEAN DEFAULT false,
    copy_count INTEGER DEFAULT 0,
    initial_copy_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    version INTEGER DEFAULT 1,
    deleted_at TIMESTAMP WITH TIME ZONE
);
```

### Prompt_Categories Junction Table
```sql
CREATE TABLE prompt_categories (
    prompt_id UUID REFERENCES prompts(id),
    category_id UUID REFERENCES categories(id),
    subcategory_id UUID REFERENCES subcategories(id),
    PRIMARY KEY (prompt_id, category_id, subcategory_id)
);
```

### Prompt_Tools Junction Table
```sql
CREATE TABLE prompt_tools (
    prompt_id UUID REFERENCES prompts(id),
    tool_id UUID REFERENCES tools(id),
    PRIMARY KEY (prompt_id, tool_id)
);
```

### Prompt_Keywords Table
```sql
CREATE TABLE prompt_keywords (
    prompt_id UUID REFERENCES prompts(id),
    keyword VARCHAR(50) NOT NULL,
    PRIMARY KEY (prompt_id, keyword)
);
```

### User_History Table
```sql
CREATE TABLE user_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    prompt_id UUID REFERENCES prompts(id),
    action_type VARCHAR(20) NOT NULL, -- 'copy', 'view'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### User_Bookmarks Table
```sql
CREATE TABLE user_bookmarks (
    user_id UUID REFERENCES users(id),
    prompt_id UUID REFERENCES prompts(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, prompt_id)
);
```

### Catalogs Table
```sql
CREATE TABLE catalogs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);
```

### Catalog_Prompts Junction Table
```sql
CREATE TABLE catalog_prompts (
    catalog_id UUID REFERENCES catalogs(id),
    prompt_id UUID REFERENCES prompts(id),
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (catalog_id, prompt_id)
);
```

### Subscriptions Table
```sql
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    plan_type VARCHAR(20) NOT NULL, -- 'monthly', '3_months', 'yearly'
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) NOT NULL, -- 'active', 'cancelled', 'expired'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Newsletter_Subscribers Table
```sql
CREATE TABLE newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Prompt_Reports Table
```sql
CREATE TABLE prompt_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    prompt_id UUID REFERENCES prompts(id),
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'reviewed', 'resolved'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Prompt_Feedback Table
```sql
CREATE TABLE prompt_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    prompt_id UUID REFERENCES prompts(id),
    feedback TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Admin Panel Schema (admin)

### Admin_Users Table
```sql
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL, -- 'super_admin', 'admin'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);
```

### Admin_Activity_Log Table
```sql
CREATE TABLE admin_activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES admin_users(id),
    action_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Indexes

```sql
-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_country ON users(country);

-- Categories & Subcategories
CREATE INDEX idx_categories_name_en ON categories(name_en);
CREATE INDEX idx_categories_name_ar ON categories(name_ar);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_subcategories_category_id ON subcategories(category_id);

-- Prompts
CREATE INDEX idx_prompts_is_pro ON prompts(is_pro);
CREATE INDEX idx_prompts_copy_count ON prompts(copy_count DESC);
CREATE INDEX idx_prompts_title_en ON prompts(title_en);
CREATE INDEX idx_prompts_title_ar ON prompts(title_ar);

-- History & Bookmarks
CREATE INDEX idx_user_history_user_id ON user_history(user_id);
CREATE INDEX idx_user_history_created_at ON user_history(created_at DESC);
CREATE INDEX idx_user_bookmarks_user_id ON user_bookmarks(user_id);

-- Catalogs
CREATE INDEX idx_catalogs_user_id ON catalogs(user_id);
CREATE INDEX idx_catalog_prompts_catalog_id ON catalog_prompts(catalog_id);
CREATE INDEX idx_catalog_prompts_prompt_id ON catalog_prompts(prompt_id);

-- Subscriptions
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
```

## Notes

1. **Soft Delete**: Tables with `deleted_at` support soft delete functionality
2. **Timestamps**: All tables include `created_at` and relevant tables include `updated_at`
3. **UUID**: Using UUID for all primary keys for better distribution and security
4. **Indexing**: Indexes on frequently queried columns and foreign keys
5. **Constraints**: Foreign key constraints ensure data integrity
6. **Multilingual**: Separate columns for English and Arabic content
7. **Audit Trail**: Admin activities are logged for security

## Future Considerations

1. **Partitioning**: Consider partitioning large tables (prompts, user_history) if data grows significantly
2. **Full-Text Search**: May need to implement PostgreSQL full-text search indexes
3. **Caching**: Consider caching strategies for frequently accessed data
4. **Archiving**: Implement archiving strategy for old history/logs
