import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { IpcRenderer } from 'electron'; // Poprawny import
import { Subject } from 'rxjs';
import { injectWindow } from '~/utils/injection/window';

@Injectable({
  providedIn: 'root',
})
export class ElectronService {
  private window = injectWindow();
  public isElectron = !!(this.window as any)?.electronAPI;
  private ipcRenderer: IpcRenderer | null = null; // Deklaracja właściwości

  public windowChange = new Subject();

  public constructor(
    private router: Router,
    private zone: NgZone,
  ) {
    if (this.isElectron) {
      this.ipcRenderer = (this.window as any).electronAPI.ipcRenderer;
      this.ipcRenderer?.addListener('window-change', () => {
        this.windowChange.next(null);
      });
      this.ipcRenderer?.addListener('open-url', (e, url: string) => {
        this.onDeeplinkReceived(url);
      });
    }
  }

  public get isElectronReady(): boolean {
    return this.isElectron;
  }

  public get ipc() {
    return this.ipcRenderer;
  }

  public sendWindowClose() {
    this.ipcRenderer?.invoke('window-close');
  }

  public sendWindowMin() {
    this.ipcRenderer?.invoke('window-minimize');
  }

  public sendWindowMax() {
    this.ipcRenderer?.invoke('window-maximize');
  }

  public sendWindowRestore() {
    this.ipcRenderer?.invoke('window-unmaximize');
  }

  public isWindowMaximized(): Promise<boolean> {
    return this.ipcRenderer?.invoke('is-window-maximized') || Promise.resolve(false);
  }

  public tabs(): Promise<boolean> {
    return this.ipcRenderer?.invoke('window-tabs') || Promise.resolve(false);
  }

  protected onDeeplinkReceived(link: string) {
    this.zone.run(() => {
      if (!link.startsWith('nw-buddy://')) {
        return;
      }
      this.router.navigateByUrl(link.replace('nw-buddy://', '/'));
    });
  }

  public getAuctions(options: { limit?: number; offset?: number } = {}): Promise<{ success: boolean; data?: any[]; error?: string }> {
    if (!this.isElectron) {
      return Promise.resolve({ success: true, data: [] });
    }
    return this.ipcRenderer?.invoke('get-auctions', options) || Promise.resolve({ success: false, error: 'IPC not available' });
  }

  public getBuyOrders(options: { limit?: number; offset?: number } = {}): Promise<{ success: boolean; data?: any[]; error?: string }> {
    if (!this.isElectron) {
      return Promise.resolve({ success: true, data: [] });
    }
    return this.ipcRenderer?.invoke('get-buy-orders', options) || Promise.resolve({ success: false, error: 'IPC not available' });
  }
}