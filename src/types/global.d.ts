interface Window {
  $message?: import("antd/es/message/interface").MessageInstance;
  $modal?: Omit<import("antd/es/modal/confirm").ModalStaticFunctions, "warn">;
  $notification?: import("antd/es/notification/interface").NotificationInstance;
}

// TypeScript declaration for 'file-saver' to satisfy imports
declare module "file-saver" {
  export function saveAs(data: Blob | File, filename?: string, options?: any): void;
}
