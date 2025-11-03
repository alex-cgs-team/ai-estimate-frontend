import type { CountryCode } from "libphonenumber-js";
import { getCountryCallingCode } from "react-phone-number-input";

export const getNationalDigits = (e164: string, defaultCountry = "UA") => {
  const digits = (e164 || "").replace(/\D/g, "");
  const cc = getCountryCallingCode(defaultCountry as CountryCode);
  return digits.startsWith(cc) ? digits.slice(cc.length) : digits;
};
