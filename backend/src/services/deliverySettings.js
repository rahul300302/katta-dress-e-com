import env from '../config/env.js';
import { SiteSetting } from '../models/index.js';

export const DELIVERY_SETTINGS_KEY = 'delivery_settings';

export const DEFAULT_DELIVERY_SETTINGS = {
  charge: env.deliveryCharge,
  freeDeliveryMinOrder: 0,
};

export function resolveDeliveryCharge(subtotal, settings = DEFAULT_DELIVERY_SETTINGS) {
  const charge = Math.max(0, Number(settings.charge) || 0);
  const minOrder = Math.max(0, Number(settings.freeDeliveryMinOrder) || 0);
  if (minOrder > 0 && subtotal >= minOrder) {
    return 0;
  }
  return charge;
}

export async function getDeliverySettings() {
  let setting = await SiteSetting.findOne({ where: { key: DELIVERY_SETTINGS_KEY } });
  if (!setting) {
    setting = await SiteSetting.create({
      key: DELIVERY_SETTINGS_KEY,
      value: DEFAULT_DELIVERY_SETTINGS,
    });
  }

  const value = setting.value || {};
  return {
    charge: Math.max(0, Number(value.charge ?? DEFAULT_DELIVERY_SETTINGS.charge) || 0),
    freeDeliveryMinOrder: Math.max(
      0,
      Number(value.freeDeliveryMinOrder ?? DEFAULT_DELIVERY_SETTINGS.freeDeliveryMinOrder) || 0
    ),
  };
}
