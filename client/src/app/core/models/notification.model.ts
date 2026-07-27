export interface NotificationItem {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'ASSIGNMENT' | 'GRADE' | 'SYSTEM';
  isRead: boolean;
  link?: string;
  createdAt: string;
}
