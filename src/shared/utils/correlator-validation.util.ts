/**
 * @see {@link https://github.com/camaraproject/Commonalities/blob/main/documentation/CAMARA-API-Design-Guide.md#x-correlator-header Camara API Design guideline}
 */
export const validateXCorrelator = (xcorrelator: string): boolean => {
  if (!xcorrelator) return false;
  const regex = /^[a-zA-Z0-9-_:;.\/<>{}]{0,256}$/;
  return regex.test(xcorrelator);
};
