import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export abstract class FaktoriaDataService {
  abstract getFaktoriaData(options?: { limit: number, offset: number }): Promise<{ success: boolean, data?: any[], error?: string }>;
}