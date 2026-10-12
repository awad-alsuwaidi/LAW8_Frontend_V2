import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SharedModule } from '@shared/shared.module';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-invalid-subdomain',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedModule],
  templateUrl: './invalid-subdomain.component.html',
  styleUrls: ['./invalid-subdomain.component.scss'],
})
export class InvalidSubdomainComponent {
  private translate = inject(TranslateService);
  currentHost = window.location.hostname;
  isProduction = environment.production;
  adminEmail = 'support@law8.com';
  mainWebsiteUrl = 'https://law8.com/';
  currentLang: 'ar' | 'en' = 'en';

ngOnInit(): void {
  const lang = (localStorage.getItem('lang') as 'ar' | 'en') || 'en';
  this.currentLang = lang;

  this.translate.use(lang);
  this.applyDirection();
}
  get isArabic(): boolean {
    return this.currentLang === 'ar';
  }

 switchLanguage(lang: 'ar' | 'en') {
  this.currentLang = lang;

  localStorage.setItem('lang', lang);

  this.translate.use(lang);

  this.applyDirection();
}

  applyDirection() {
    document.documentElement.lang = this.currentLang;
    document.documentElement.dir = this.isArabic ? 'rtl' : 'ltr';
  }

  contactAdmin(): void {
    const subject = this.isArabic
? 'طلب الوصول إلى النظام'
: 'Workspace Access Request';

    const body = this.isArabic
      ? `مرحباً،

حاولت الدخول إلى ساب دومين غير متاح.

الدومين الحالي: ${window.location.hostname}
الرابط الكامل: ${window.location.href}

أرجو المساعدة في الوصول إلى رابط العمل الصحيح.

شكراً لكم.`
      : `Hello,

I tried to access a subdomain that is not available.

Current host: ${window.location.hostname}
Full URL: ${window.location.href}

Please help me to reach the correct workspace link.

Thank you.`;

    const mailtoLink = `mailto:${this.adminEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, '_self');
  }

  goHome(): void {
    window.location.href = this.mainWebsiteUrl;
  }
}