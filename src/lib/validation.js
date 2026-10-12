export const PASSWORD_LENGTH = 8;

export function validationRegisteration({
  name,
  email,
  password,
  confirmPassword,
}) {
  const errors = {};

  if (!name || name.length < 2) {
    errors.name = "השם חייב להכיל לפחות 2 תווים.";
  } else if (name.length > 60) {
    errors.name = "השם ארוך מדי.";
  }

  if (!email) {
    errors.email = "כתובת אימייל היא שדה חובה.";
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    errors.email = "נא להזין כתובת אימייל תקינה.";
  }

  if (!password) {
    errors.password = "סיסמה היא שדה חובה.";
  } else if (password.length < PASSWORD_LENGTH) {
    errors.password = `הסיסמה חייבת להכיל לפחות ${PASSWORD_LENGTH} תווים.`;
  } else if (password.length > 100) {
    errors.password = "הסיסמה ארוכה מדי.";
  }

  if (!confirmPassword) {
    errors.confirmPassword = "נא לאשר את הסיסמה.";
  } else if (confirmPassword !== password) {
    errors.confirmPassword = "הסיסמאות אינן תואמות.";
  }

  return errors;
}
