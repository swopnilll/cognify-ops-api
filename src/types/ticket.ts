export interface TicketPayload {
    project_id: number;
    name: string;
    description?: string;
    created_by: string;
    status_id?: number;
  }