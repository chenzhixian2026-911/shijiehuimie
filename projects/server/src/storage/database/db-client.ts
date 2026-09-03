import pkg from 'pg';
const { Pool } = pkg;

let pool: pkg.Pool | null = null;

function getPool(): pkg.Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is not set');
    }
    pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false,
      },
    });
  }
  return pool;
}

class QueryBuilder {
  private table: string;
  private selectColumns: string = '*';
  private whereConditions: string[] = [];
  private whereValues: any[] = [];
  private orderByColumn: string | null = null;
  private orderAscending: boolean = true;
  private limitCount: number | null = null;
  private insertData: Record<string, any> | null = null;
  private inColumn: string | null = null;
  private inValues: any[] = [];

  constructor(table: string) {
    this.table = table;
  }

  select(columns: string): this {
    this.selectColumns = columns === '*' ? '*' : columns;
    return this;
  }

  eq(column: string, value: any): this {
    this.whereConditions.push(`${column} = $${this.whereValues.length + 1}`);
    this.whereValues.push(value);
    return this;
  }

  in(column: string, values: any[]): this {
    if (values.length === 0) return this;
    const placeholders = values.map((_, i) => `$${this.whereValues.length + i + 1}`).join(', ');
    this.whereConditions.push(`${column} IN (${placeholders})`);
    this.whereValues.push(...values);
    return this;
  }

  order(column: string, options: { ascending?: boolean } = {}): this {
    this.orderByColumn = column;
    this.orderAscending = options.ascending !== false;
    return this;
  }

  limit(count: number): QueryFinalizer {
    this.limitCount = count;
    return new QueryFinalizer(this);
  }

  insert(data: Record<string, any>): InsertBuilder {
    this.insertData = data;
    return new InsertBuilder(this);
  }

  single(): Promise<{ data: any; error: any }> {
    return this.executeSingle();
  }

  maybeSingle(): Promise<{ data: any; error: any }> {
    return this.executeSingle();
  }

  then<TResult1 = { data: any[]; error: any }, TResult2 = never>(
    onfulfilled?: ((value: { data: any[]; error: any }) => TResult1 | PromiseLike<TResult1>),
    _onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>)
  ): PromiseLike<TResult1 | TResult2> {
    return this.executeList().then(onfulfilled);
  }

  private async executeSingle(): Promise<{ data: any; error: any }> {
    try {
      const result = await this.runQuery();
      if (result.rows.length === 0) {
        return { data: null, error: null };
      }
      return { data: result.rows[0], error: null };
    } catch (error) {
      console.error('Database query error:', error);
      return { data: null, error };
    }
  }

  private async executeList(): Promise<{ data: any[]; error: any }> {
    try {
      const result = await this.runQuery();
      return { data: result.rows, error: null };
    } catch (error) {
      console.error('Database query error:', error);
      return { data: [], error };
    }
  }

  private buildSelectSql(): { sql: string; values: any[] } {
    let sql = `SELECT ${this.selectColumns} FROM ${this.table}`;
    const values = [...this.whereValues];
    let valueIndex = this.whereValues.length + 1;

    if (this.whereConditions.length > 0) {
      sql += ' WHERE ' + this.whereConditions.join(' AND ');
    }

    if (this.inColumn && this.inValues.length > 0) {
      const placeholders = this.inValues.map(() => `$${valueIndex++}`).join(', ');
      if (this.whereConditions.length > 0) {
        sql += ' AND ';
      } else {
        sql += ' WHERE ';
      }
      sql += `${this.inColumn} IN (${placeholders})`;
      values.push(...this.inValues);
    }

    if (this.orderByColumn) {
      sql += ` ORDER BY ${this.orderByColumn} ${this.orderAscending ? 'ASC' : 'DESC'}`;
    }

    if (this.limitCount !== null) {
      sql += ` LIMIT ${this.limitCount}`;
    }

    return { sql, values };
  }

  private buildInsertSql(): { sql: string; values: any[] } {
    if (!this.insertData) {
      throw new Error('No insert data');
    }
    const columns = Object.keys(this.insertData);
    const values = Object.values(this.insertData);
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
    const sql = `INSERT INTO ${this.table} (${columns.join(', ')}) VALUES (${placeholders}) RETURNING *`;
    return { sql, values };
  }

  private async runQuery(): Promise<pkg.QueryResult<any>> {
    if (this.insertData) {
      const { sql, values } = this.buildInsertSql();
      return getPool().query(sql, values);
    } else {
      const { sql, values } = this.buildSelectSql();
      return getPool().query(sql, values);
    }
  }
}

class QueryFinalizer {
  constructor(private builder: QueryBuilder) {}

  then<TResult1 = { data: any[]; error: any }, TResult2 = never>(
    onfulfilled?: ((value: { data: any[]; error: any }) => TResult1 | PromiseLike<TResult1>),
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>)
  ): PromiseLike<TResult1 | TResult2> {
    return this.builder.then(onfulfilled, onrejected);
  }
}

class InsertBuilder {
  constructor(private builder: QueryBuilder) {}

  select(_columns?: string): { single(): Promise<{ data: any; error: any }> } {
    return {
      single: () => this.builder.single()
    };
  }
}

function createClient() {
  return {
    from(table: string): QueryBuilder {
      return new QueryBuilder(table);
    }
  };
}

async function initTables(): Promise<void> {
  const pool = getPool();
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );
    `);
    await pool.query(`CREATE INDEX IF NOT EXISTS users_username_idx ON users(username);`);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        summary TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );
    `);
    await pool.query(`CREATE INDEX IF NOT EXISTS blog_posts_created_at_idx ON blog_posts(created_at);`);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS game_records (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        scenario TEXT NOT NULL,
        final_score INTEGER NOT NULL,
        result TEXT NOT NULL,
        played_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );
    `);
    await pool.query(`CREATE INDEX IF NOT EXISTS game_records_user_id_idx ON game_records(user_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS game_records_played_at_idx ON game_records(played_at);`);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS health_check (
        id SERIAL NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    console.log('Database tables initialized');
  } catch (error) {
    console.error('Failed to initialize tables:', error);
    throw error;
  }
}

export { createClient as getSupabaseClient, initTables, getPool };
