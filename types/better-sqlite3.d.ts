declare module 'better-sqlite3' {
  interface Statement<BindParameters extends unknown[] = unknown[]> {
    run(...params: BindParameters): Database.RunResult
    get(...params: BindParameters): unknown
    all(...params: BindParameters): unknown[]
  }

  interface Database {
    prepare<BindParameters extends unknown[] = unknown[]>(
      sql: string
    ): Statement<BindParameters>
    pragma(pragma: string, options?: { simple?: boolean }): unknown
    transaction<T>(fn: () => T): () => T
    close(): void
  }

  namespace Database {
    interface RunResult {
      changes: number
      lastInsertRowid: number | bigint
    }
  }

  interface DatabaseConstructor {
    new (filename: string, options?: object): Database
    (filename: string, options?: object): Database
  }

  const Database: DatabaseConstructor
  export = Database
}
