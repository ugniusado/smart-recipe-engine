import api from './client';
import type { DashboardSummary, MonthlyReport, WasteFrequency, SavingsMilestone } from '../types';

export const reportsApi = {
  getDashboard: () =>
    api.get<DashboardSummary>('/reports/dashboard').then(r => r.data),
  getMonthly: (months = 6) =>
    api.get<MonthlyReport[]>(`/reports/monthly?months=${months}`).then(r => r.data),
  getWasteFrequency: () =>
    api.get<WasteFrequency[]>('/reports/waste-frequency').then(r => r.data),
  getMilestones: () =>
    api.get<SavingsMilestone>('/reports/milestones').then(r => r.data),
};
