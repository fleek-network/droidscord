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
