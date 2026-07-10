import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// CMS auth is handled client-side — JWT stored in localStorage, verified by FastAPI.
export function proxy(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
