// Form rules shared by login, checkout and the profile page.
// Each check returns an error message, or "" when the value is fine.

// letters in any script (so Hindi names work too), plus spaces, dots, apostrophes, hyphens
const NAME_RE = /^\p{L}[\p{L}\p{M} .'-]*$/u;
const PLACE_RE = NAME_RE;

// keep only digits (for phone, pincode and OTP fields as they're typed)
export const digitsOnly = (value, max) => String(value ?? "").replace(/\D/g, "").slice(0, max);

export const validatePhone = (value) => {
  const v = String(value ?? "").trim();
  if (!v) return "Mobile number is required.";
  if (!/^\d{10}$/.test(v)) return "Enter a 10-digit mobile number.";
  if (!/^[6-9]/.test(v)) return "Indian mobile numbers start with 6, 7, 8 or 9.";
  return "";
};

export const validateOtp = (value, length = 4) => {
  const v = String(value ?? "").trim();
  if (!v) return "Please enter the OTP.";
  if (!new RegExp(`^\\d{${length}}$`).test(v)) return `The OTP is ${length} digits.`;
  return "";
};

export const validateName = (value) => {
  const v = String(value ?? "").trim();
  if (!v) return "Name is required.";
  if (v.length < 2) return "Name is too short.";
  if (!NAME_RE.test(v)) return "Use letters only.";
  return "";
};

export const validateStreet = (value) => {
  const v = String(value ?? "").trim();
  if (!v) return "Street address is required.";
  if (v.length < 5) return "Add house number and street (at least 5 characters).";
  return "";
};

const validatePlace = (label) => (value, { required = true } = {}) => {
  const v = String(value ?? "").trim();
  if (!v) return required ? `${label} is required.` : "";
  if (v.length < 2) return `${label} is too short.`;
  if (!PLACE_RE.test(v)) return `${label} should only have letters.`;
  return "";
};

export const validateCity = validatePlace("City");
export const validateState = validatePlace("State");

export const validatePincode = (value) => {
  const v = String(value ?? "").trim();
  if (!v) return "Pincode is required.";
  if (!/^[1-9]\d{5}$/.test(v)) return "Enter a valid 6-digit pincode.";
  return "";
};

// Errors for a delivery address, keyed by field; {} means it's valid.
// `withContact` also checks the recipient's name and phone (checkout).
export const validateAddress = (address = {}, { withContact = false, stateRequired = false } = {}) => {
  const checks = {
    ...(withContact && { name: validateName(address.name), phone: validatePhone(address.phone) }),
    street: validateStreet(address.street),
    city: validateCity(address.city),
    state: validateState(address.state, { required: stateRequired }),
    pincode: validatePincode(address.pincode),
  };
  return Object.fromEntries(Object.entries(checks).filter(([, msg]) => msg));
};
