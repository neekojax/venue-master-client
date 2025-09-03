export {};

declare global {
  export interface Window {
    /** NProgress instance */
    NProgress?: import("nprogress").NProgress;
  }

  /** Build time of the project */
  export const BUILD_TIME: string;
}
