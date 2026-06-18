type QueueStatus = "queued" | "sending" | "completed" | "failed";

type WhatsappQueueItem = {
  jobId: string;
  studentId: string;
  studentName: string;
  guardianPhone: string;
  chatId: string;
  message: string;
  status: QueueStatus;
  attempts: number;
  error?: string;
};

type QueueJob = {
  id: string;
  classGrade: string;
  classStream: string;
  term: number;
  year: number;
  examType: string;
  createdAt: string;
  total: number;
  queued: number;
  sent: number;
  failed: number;
  skipped: number;
  status: QueueStatus;
};

export type { QueueStatus, WhatsappQueueItem, QueueJob };
