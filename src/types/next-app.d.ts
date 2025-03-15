import 'next';

declare module 'next' {
  // Override the PageProps type to fix the params type issue
  export interface PageProps {
    params?: Record<string, string>;
    searchParams?: Record<string, string | string[]>;
  }
  
  // Override the ParamCheck type to fix the route handler params issue
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export interface ParamCheck<RouteType> {
    __tag__: string;
    __param_position__: string;
    __param_type__: {
      params?: Record<string, string>;
    };
  }
}

// Fix for the RouteContext type
declare global {
  interface RouteContext {
    params: Record<string, string>;
  }
}
