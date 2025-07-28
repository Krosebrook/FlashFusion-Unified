export interface QueueStatus {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  averageProcessingTime: number;
  queuedTasks: number;
}

export async function getQueueStatus(): Promise<QueueStatus> {
  const response = await fetch('/api/queue-status');
  if (!response.ok) {
    throw new Error('Failed to fetch queue status');
  }
  const data = await response.json();
  
  return {
    totalTasks: data.totalTasks || 0,
    completedTasks: data.completedTasks || 0,
    failedTasks: data.failedTasks || 0,
    averageProcessingTime: data.averageProcessingTime || 0,
    queuedTasks: data.totalTasks - data.completedTasks - data.failedTasks,
  };
}

export function getQueueHealthStatus(status: QueueStatus): { health: string; color: string } {
  const successRate = status.totalTasks > 0 ? (status.completedTasks / status.totalTasks) * 100 : 100;
  
  if (successRate >= 90) {
    return { health: "Excellent", color: "green" };
  } else if (successRate >= 70) {
    return { health: "Good", color: "yellow" };
  } else {
    return { health: "Poor", color: "red" };
  }
}
