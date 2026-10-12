import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { LOCAL_STORAGE_PREFIX } from '../utilities/defines';

/**
 * واجهة العنصر المخزّن
 */
interface StorageItem<T = any> {
  value: T;
  /** Unix timestamp بالمللي ثانية — 0 = بدون انتهاء */
  expiresAt: number;
}

/**
 * مفاتيح حساسة بتتخزن في sessionStorage (تضيع مع إغلاق التاب)
 * أي مفتاح تاني هيروح localStorage
 */
const SESSION_ONLY_KEYS = new Set<string>([
  'token',
  'accessToken',
  'refreshToken',
  'idToken',
  'authToken',
]);

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private readonly PREFIX = `${LOCAL_STORAGE_PREFIX}.`;
  private readonly platformId = inject(PLATFORM_ID);

  // ==================================================================
  // ====================       PUBLIC API       ======================
  // ==================================================================

  /**
   * حفظ قيمة — الراوتر بيختار المكان تلقائيًا:
   *   - التوكنز → sessionStorage
   *   - الباقي → localStorage
   *
   * @param ttlSeconds مدة الانتهاء بالثواني (اختياري)
   */
  set<T = any>(key: string, value: T, ttlSeconds?: number): void {
    if (!this.isBrowser()) return;
    if (value === undefined) return;

    const item: StorageItem<T> = {
      value,
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : 0,
    };

    try {
      const storage = this.pickStorage(key);
      storage.setItem(this.fullKey(key), JSON.stringify(item));
    } catch (e) {
      console.warn(`[StorageService] Failed to set "${key}"`, e);
    }
  }

  /**
   * قراءة قيمة + تنظيف تلقائي لو منتهية
   */
  get<T = any>(key: string): T | null {
    if (!this.isBrowser()) return null;

    // جرّب المكان المتوقع الأول، وبعدين التاني كـ fallback
    const primary = this.pickStorage(key);
    const secondary = primary === localStorage ? sessionStorage : localStorage;

    const raw =
      primary.getItem(this.fullKey(key)) ??
      secondary.getItem(this.fullKey(key));

    if (!raw) return null;

    try {
      const item: StorageItem<T> = JSON.parse(raw);

      // فحص انتهاء الصلاحية
      if (item.expiresAt && Date.now() > item.expiresAt) {
        this.remove(key);
        return null;
      }

      return item.value;
    } catch {
      // قيمة قديمة مش JSON — رجّعها كنص
      return raw as unknown as T;
    }
  }

  /**
   * هل المفتاح موجود وقيمته مش null؟
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * حذف مفتاح واحد من الاتنين
   */
  remove(key: string): void {
    if (!this.isBrowser()) return;
    const full = this.fullKey(key);
    localStorage.removeItem(full);
    sessionStorage.removeItem(full);
  }

  /**
   * مسح كل مفاتيح التطبيق (اللي بتبدأ بالـ prefix بتاعنا)
   * @param keepKeys مفاتيح عايز تحتفظ بها
   */
  clear(options?: { keepKeys?: string[] }): void {
    if (!this.isBrowser()) return;

    const keep = new Set(
      (options?.keepKeys ?? []).map((k) => this.fullKey(k))
    );

    [localStorage, sessionStorage].forEach((storage) => {
      const toRemove: string[] = [];
      for (let i = 0; i < storage.length; i++) {
        const k = storage.key(i);
        if (k && k.startsWith(this.PREFIX) && !keep.has(k)) {
          toRemove.push(k);
        }
      }
      toRemove.forEach((k) => storage.removeItem(k));
    });
  }

  /**
   * مسح القيم المنتهية يدويًا (اختياري — للتنظيف الدوري)
   */
  purgeExpired(): void {
    if (!this.isBrowser()) return;

    [localStorage, sessionStorage].forEach((storage) => {
      const toRemove: string[] = [];
      for (let i = 0; i < storage.length; i++) {
        const k = storage.key(i);
        if (!k?.startsWith(this.PREFIX)) continue;

        const raw = storage.getItem(k);
        if (!raw) continue;

        try {
          const item: StorageItem = JSON.parse(raw);
          if (item.expiresAt && Date.now() > item.expiresAt) {
            toRemove.push(k);
          }
        } catch {
          // تجاهل القيم غير المتوافقة
        }
      }
      toRemove.forEach((k) => storage.removeItem(k));
    });
  }

  // ==================================================================
  // ============  Explicit API (لما تكون متأكد)  ====================
  // ==================================================================

  /** حفظ في localStorage صراحة */
  setLocal<T>(key: string, value: T, ttlSeconds?: number): void {
    if (!this.isBrowser() || value === undefined) return;
    const item: StorageItem<T> = {
      value,
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : 0,
    };
    try {
      localStorage.setItem(this.fullKey(key), JSON.stringify(item));
    } catch (e) {
      console.warn(`[StorageService] setLocal failed: ${key}`, e);
    }
  }

  /** قراءة من localStorage صراحة */
  getLocal<T>(key: string): T | null {
    if (!this.isBrowser()) return null;
    return this.readFrom(localStorage, key);
  }

  /** حفظ في sessionStorage صراحة */
  setSession<T>(key: string, value: T, ttlSeconds?: number): void {
    if (!this.isBrowser() || value === undefined) return;
    const item: StorageItem<T> = {
      value,
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : 0,
    };
    try {
      sessionStorage.setItem(this.fullKey(key), JSON.stringify(item));
    } catch (e) {
      console.warn(`[StorageService] setSession failed: ${key}`, e);
    }
  }

  /** قراءة من sessionStorage صراحة */
  getSession<T>(key: string): T | null {
    if (!this.isBrowser()) return null;
    return this.readFrom(sessionStorage, key);
  }

  /** حذف من sessionStorage صراحة */
  removeSession(key: string): void {
    if (!this.isBrowser()) return;
    sessionStorage.removeItem(this.fullKey(key));
  }

  /** حذف من localStorage صراحة */
  removeLocal(key: string): void {
    if (!this.isBrowser()) return;
    localStorage.removeItem(this.fullKey(key));
  }

  // ==================================================================
  // =============  Deprecated aliases (للتوافق)  ====================
  // ==================================================================

  /** @deprecated استخدم set() */
  setStorage(key: string, value: any): void {
    this.set(key, value);
  }

  /** @deprecated استخدم get() */
  getStorage(key: string): any {
    return this.get(key);
  }

  /** @deprecated استخدم remove() */
  removeItemStorage(key: string): void {
    this.remove(key);
  }

  /** @deprecated استخدم clear({ keepKeys }) */
  clearStorage(): void {
    const remembered = this.get('rememberedUser');
    this.clear();
    if (remembered) this.set('rememberedUser', remembered);
  }

  // ==================================================================
  // ====================       PRIVATE       ========================
  // ==================================================================

  private fullKey(key: string): string {
    return `${this.PREFIX}${key}`;
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  /** اختيار المكان حسب نوع المفتاح */
  private pickStorage(key: string): Storage {
    return SESSION_ONLY_KEYS.has(key) ? sessionStorage : localStorage;
  }

  /** قراءة موحّدة مع فحص TTL */
  private readFrom<T>(storage: Storage, key: string): T | null {
    const raw = storage.getItem(this.fullKey(key));
    if (!raw) return null;

    try {
      const item: StorageItem<T> = JSON.parse(raw);
      if (item.expiresAt && Date.now() > item.expiresAt) {
        storage.removeItem(this.fullKey(key));
        return null;
      }
      return item.value;
    } catch {
      return raw as unknown as T;
    }
  }
}