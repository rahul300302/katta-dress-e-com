export function toApi(row) {
  if (row == null) return row;
  const data = row.toJSON ? row.toJSON() : { ...row };
  if (data.id != null) data._id = String(data.id);
  return data;
}

export function toApiList(rows) {
  return rows.map((r) => toApi(r));
}
