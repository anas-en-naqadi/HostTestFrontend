export type NotificationItem = {
    id:         number;
    title:      string;
    type:       string;
    content:    string;
    metadata:   {thumbnail_url?:string,slug?:string,title?:string};    // or a more specific type if you have one
    created_at: Date;
  };

  export interface NotificationListPayload {
    notifications: NotificationItem[];
    unreadCount: number;
  }