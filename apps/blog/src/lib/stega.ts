// Strip stega encoding invisible characters
export const clean = (str: string) =>
  str.replace(/[\u200B-\u200F\u2028-\u202F\uFEFF\u00AD]/g, "")
