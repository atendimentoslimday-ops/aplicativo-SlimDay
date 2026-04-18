/**
 * Utilitário para disparar eventos do Facebook Pixel com segurança.
 * Garante que a função fbq existe no objeto window antes de tentar disparar.
 */

type FacebookEvent = 'PageView' | 'Lead' | 'InitiateCheckout' | 'Purchase' | 'CompleteRegistration';

export const trackFacebookEvent = (eventName: FacebookEvent, params?: Record<string, any>) => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    if (params) {
      (window as any).fbq('track', eventName, params);
      console.log(`[FB Pixel] Evento disparado: ${eventName}`, params);
    } else {
      (window as any).fbq('track', eventName);
      console.log(`[FB Pixel] Evento disparado: ${eventName}`);
    }
  } else {
    console.warn(`[FB Pixel] Falha ao disparar ${eventName}: fbq não encontrado no window.`);
  }
};
