import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideLucideIcons, LucideUser, LucideMail, LucideLock, LucideEye, LucideEyeOff, LucideAlertCircle, LucideLoader, LucideUserPlus, LucideArrowRight, LucideArrowLeft, LucideBus, LucidePencil, LucideTrash, LucidePlus, LucideMapPin, LucideClock, LucideCalendar } from '@lucide/angular';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    provideAnimations(),
    provideLucideIcons(
      LucideUser,
      LucideMail,
      LucideLock,
      LucideEye,
      LucideEyeOff,
      LucideAlertCircle,
      LucideLoader,
      LucideUserPlus,
      LucideArrowRight,
      LucideArrowLeft,
      LucideBus,
      LucidePencil,
      LucideTrash,
      LucidePlus,
      LucideMapPin,
      LucideClock,
      LucideCalendar,
    ),
  ],
};