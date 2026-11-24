export function formatAuthors(authors: string[]): string {
  if (authors.length === 0) return "Autor desconocido";
  return authors.slice(0, 3).join(", ");
}

const dateFormatter = new Intl.DateTimeFormat("es-CO", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "America/Bogota",
});

export function formatDate(date: Date): string {
  return dateFormatter.format(date);
}

export function formatLikes(count: number): string {
  return new Intl.NumberFormat("es-CO").format(count);
}
