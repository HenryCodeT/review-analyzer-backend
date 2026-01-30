// Domain: Exceptions
//
// ── API Response Structure (always uniform) ─────────────────────
//
// {
//   "success": boolean,
//   "data":    object | null,
//   "error":   string | null,
//   "code":    string | null,
//   "traceId": string
// }
//
// ── Error Codes ─────────────────────────────────────────────────
//
//  Code             HTTP   When
//  ───────────────  ─────  ──────────────────────────────────────
//  VALIDATION       400    Input missing or out of range
//  NOT_FOUND        404    Entity does not exist in DB
//  ALREADY_EXISTS   409    Duplicate resource
//  INTERNAL_ERROR   500    Unhandled / infrastructure errors
//

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 400,
  ) {
    super(message);
  }
}
