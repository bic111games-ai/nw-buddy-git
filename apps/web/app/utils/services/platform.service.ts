import { Platform as AngularPlatform } from '@angular/cdk/platform'
import { Injectable, inject } from '@angular/core'
import { Platform as IonicPlatform } from '@ionic/angular/standalone'
import { ElectronService } from '~/electron'
import { NW_BUDDY_LIVE, environment } from '../../../environments'
import { injectWindow } from '../injection/window'
import { ActivatedRoute } from '@angular/router'
import { toSignal } from '@angular/core/rxjs-interop'

@Injectable({ providedIn: 'root' })
export class PlatformService {
  public readonly env = environment

  private ngPlatform = inject(AngularPlatform)
  private ionPlatform = inject(IonicPlatform)
  private electron = inject(ElectronService)
  private window = injectWindow()

  /**
   * Whether the Angular application is being rendered in the browser.
   */
  public get isBrowser() {
    return this.ngPlatform.isBrowser
  }
  /**
   * Whether the Angular application is being rendered in server.
   */
  public get isServer() {
    return !this.ngPlatform.isBrowser
  }
  /**
   * Whether the current browser is Microsoft Edge.
   */
  public get isEdge() {
    return this.ngPlatform.EDGE
  }
  /**
   * Whether the current rendering engine is Microsoft Trident.
   */
  public get isTrident() {
    return this.ngPlatform.TRIDENT
  }
  /**
   * Whether the current rendering engine is Blink.
   */
  public get isBlink() {
    return this.ngPlatform.BLINK
  }
  /**
   * Whether the current rendering engine is WebKit.
   */
  public get isWebkit() {
    return this.ngPlatform.WEBKIT
  }
  /**
   * Whether the current platform is Apple iOS.
   */
  public get isIos() {
    return this.ngPlatform.IOS
  }
  /**
   * Whether the current browser is Firefox.
   */
  public get isFirefox() {
    return this.ngPlatform.FIREFOX
  }
  /**
   * Whether the current platform is Android.
   */
  public get isAndroid() {
    return this.ngPlatform.ANDROID
  }
  /**
   * Whether the current browser is Safari.
   */
  public get isSafari() {
    return this.ngPlatform.SAFARI
  }

  /**
   * Whether the current platform is Overwolf
   */
  public get isOverwolf() {
    return !!this.window['___overwolf___']
  }

  /**
   * Whether the current platform is Electron
   */
  public get isElectron() {
    return this.electron.isElectron || this.userAgent.includes('Electron');
  }

  /**
   * Whether the website is embedded in an iframe
   */
  public get isIframe() {
    return this.window.self !== this.window.top
  }

  public get isDesktop() {
    return this.ionPlatform.is('desktop')
  }

  public get userAgent() {
    return this.window.navigator.userAgent
  }

  protected get isStandalone() {
    return this.env.standalone
  }

  public get websiteUrl() {
    if (this.isStandalone) {
      return NW_BUDDY_LIVE
    }
    return location.origin
  }

  public get isEmbed() {
    const url = new URL(this.window.location.toString())
    if (url.searchParams.get('embed') === 'true') {
      return true
    }
    return url.pathname.split('/').some((it) => it === 'embed')
  }
}
