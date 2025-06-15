/**
 * Utilitaires pour gérer les dates de rétro
 * La rétro tombe le dernier jeudi de chaque mois
 */

/**
 * Trouve le dernier jeudi d'un mois donné
 */
export function getLastThursdayOfMonth(year: number, month: number): Date {
  // Créer une date pour le dernier jour du mois
  const lastDayOfMonth = new Date(year, month, 0);
  
  // Trouver le jour de la semaine (0 = dimanche, 1 = lundi, ..., 4 = jeudi)
  const lastDay = lastDayOfMonth.getDay();
  
  // Calculer combien de jours reculer pour arriver au dernier jeudi
  // Si le dernier jour est un jeudi (4), on ne recule pas
  // Sinon, on recule jusqu'au jeudi précédent
  const daysToSubtract = lastDay >= 4 ? lastDay - 4 : lastDay + 3;
  
  const lastThursday = new Date(lastDayOfMonth);
  lastThursday.setDate(lastDayOfMonth.getDate() - daysToSubtract);
  
  return lastThursday;
}

/**
 * Trouve la date de la prochaine rétro (dernier jeudi du mois courant ou suivant)
 */
export function getNextRetroDate(): Date {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1; // getMonth() retourne 0-11, on veut 1-12
  
  // Chercher le dernier jeudi du mois courant
  const currentMonthLastThursday = getLastThursdayOfMonth(currentYear, currentMonth);
  
  // Si le dernier jeudi du mois courant n'est pas encore passé, c'est notre prochaine rétro
  if (currentMonthLastThursday >= today) {
    return currentMonthLastThursday;
  }
  
  // Sinon, chercher le dernier jeudi du mois suivant
  let nextMonth = currentMonth + 1;
  let nextYear = currentYear;
  
  if (nextMonth > 12) {
    nextMonth = 1;
    nextYear = currentYear + 1;
  }
  
  return getLastThursdayOfMonth(nextYear, nextMonth);
}

/**
 * Calcule le nombre de jours restant avant la prochaine rétro
 */
export function getDaysUntilNextRetro(): number {
  const today = new Date();
  const nextRetro = getNextRetroDate();
  
  // Calculer la différence en millisecondes
  const diffTime = nextRetro.getTime() - today.getTime();
  
  // Convertir en jours (arrondir vers le haut pour inclure le jour partiel)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
}

/**
 * Formate la date de la prochaine rétro pour l'affichage
 */
export function formatRetroDate(date: Date): string {
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Retourne un objet avec toutes les informations sur la prochaine rétro
 */
export function getRetroInfo() {
  const nextRetroDate = getNextRetroDate();
  const daysUntil = getDaysUntilNextRetro();
  const formattedDate = formatRetroDate(nextRetroDate);
  
  return {
    date: nextRetroDate,
    daysUntil,
    formattedDate,
    isToday: daysUntil === 0,
    isTomorrow: daysUntil === 1
  };
} 