export const LEAD_STATUSES = [
  "Yeni müraciət",
  "Əlaqə saxlanıldı",
  "Görüş təyin edildi",
  "Təklif göndərildi",
  "Danışıq gedir",
  "Qazanıldı",
  "İtirildi",
];

export const LEAD_STATUS_COLORS = {
  "Yeni müraciət": "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  "Əlaqə saxlanıldı": "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300",
  "Görüş təyin edildi": "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  "Təklif göndərildi": "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  "Danışıq gedir": "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  "Qazanıldı": "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  "İtirildi": "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
};

export const LEAD_SOURCES = ["Instagram", "Facebook", "Vebsayt", "Tövsiyə", "Zəng", "Digər"];

export const ACTIVITY_TYPES = ["Zəng", "WhatsApp", "Görüş", "Email"];

export const AZ_MONTHS = ["Yan", "Fev", "Mar", "Apr", "May", "İyn", "İyl", "Avq", "Sen", "Okt", "Noy", "Dek"];

export const formatMoney = (n) => `${(n || 0).toLocaleString("az-AZ")} ₼`;

export const formatDate = (d) => {
  if (!d) return "—";
  const date = new Date(d);
  return `${date.getDate()} ${AZ_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
};