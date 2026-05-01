/** Strip stega encoding invisible characters. */
export const stripStega = (str: string) =>
  str.replace(/[\u200B-\u200F\u2028-\u202F\uFEFF\u00AD]/g, "")
