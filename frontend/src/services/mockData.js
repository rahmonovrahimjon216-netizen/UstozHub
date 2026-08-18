import { set, KEYS } from './storageService';

export const initializeMockData = () => {
  // Demo mock data completely disabled
  set(KEYS.INITIALIZED, true);
};

export default { initializeMockData };
