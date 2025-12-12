/**
 * @fileoverview Batch processing and SQL placeholder utilities
 * @module @leaderboard/database/utils/batch
 *
 * This module provides utility functions for batch processing arrays
 * and generating SQL positional parameter placeholders for bulk inserts.
 */

// =============================================================================
// Array Batching
// =============================================================================

/**
 * Splits an array into smaller arrays of a specified maximum size.
 *
 * @remarks
 * This function is essential for bulk database operations to avoid hitting
 * PostgreSQL's parameter limits. The maximum number of parameters in a
 * prepared statement varies by PostgreSQL version but is typically around
 * 32,767. By batching arrays, we can safely handle large datasets.
 *
 * @typeParam T - The type of elements in the array
 *
 * @param array - The array to split into batches
 * @param batchSize - Maximum number of elements per batch
 *
 * @returns An array of arrays, each containing at most `batchSize` elements
 *
 * @example
 * ```typescript
 * const users = ["alice", "bob", "charlie", "david", "eve"];
 * const batches = batchArray(users, 2);
 * // Result: [["alice", "bob"], ["charlie", "david"], ["eve"]]
 *
 * // Process each batch
 * for (const batch of batches) {
 *   await insertUsers(batch);
 * }
 * ```
 */
export function batchArray<T>(array: T[], batchSize: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += batchSize) {
    result.push(array.slice(i, i + batchSize));
  }
  return result;
}

// =============================================================================
// SQL Placeholder Generation
// =============================================================================

/**
 * Generates SQL positional parameter placeholders for batch INSERT statements.
 *
 * @remarks
 * PostgreSQL uses positional parameters ($1, $2, ...) for prepared statements.
 * This function generates the VALUES clause for bulk inserts with the correct
 * placeholder structure for the given number of rows and columns.
 *
 * The generated placeholders are formatted with newlines for readability
 * in debug output and query logs.
 *
 * @param length - Number of rows to insert
 * @param cols - Number of columns per row
 *
 * @returns SQL placeholder string ready for use in a VALUES clause
 *
 * @example
 * ```typescript
 * // For inserting 2 rows with 3 columns each:
 * const placeholders = getSqlPositionalParamPlaceholders(2, 3);
 * // Result: "\n        ($1, $2, $3), \n        ($4, $5, $6)"
 *
 * // Use in a query:
 * const query = `
 *   INSERT INTO users (name, email, role)
 *   VALUES ${placeholders}
 * `;
 * await db.query(query, [
 *   "Alice", "alice@example.com", "admin",
 *   "Bob", "bob@example.com", "user"
 * ]);
 * ```
 *
 * @example
 * ```typescript
 * // Dynamic batch insert
 * const users = [{ name: "A", email: "a@test.com" }, { name: "B", email: "b@test.com" }];
 * const placeholders = getSqlPositionalParamPlaceholders(users.length, 2);
 * const params = users.flatMap(u => [u.name, u.email]);
 * await db.query(`INSERT INTO users (name, email) VALUES ${placeholders}`, params);
 * ```
 */
export function getSqlPositionalParamPlaceholders(length: number, cols: number): string {
  const params = Array.from({ length: length * cols }, (_, i) => `$${i + 1}`);
  return batchArray(params, cols)
    .map((p) => `\n        (${p.join(", ")})`)
    .join(", ");
}
