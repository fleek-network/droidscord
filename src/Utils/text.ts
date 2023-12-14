type Placeholder = {
  key: string;
  val: string;
};

export const textTemplt = ({
  tmplt,
  placeholders,
}: {
  tmplt: string;
  placeholders: Placeholder[];
}): string => {
  const output = placeholders.reduce((acc, curr) => {
    if (!acc.includes(curr.key)) return acc;

    return acc.replace(curr.key, curr.val);
  }, tmplt);

  return output;
};

export const isRTLText = (text: string) =>
  text.match(/[\u04c7-\u0591\u05D0-\u05EA\u05F0-\u05F4\u0600-\u06FF]/gi);

export const convertRtfToPlain = (rtf: string) => {
  rtf = rtf.replace(/\\par[d]?/g, "");
  return rtf
    .replace(/\{\*?\\[^{}]+}|[{}]|\\\n?[A-Za-z]+\n?(?:-?\d+)?[ ]?/g, "")
    .trim();
};
