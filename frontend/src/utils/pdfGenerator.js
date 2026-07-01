import { jsPDF } from 'jspdf';

/**
 * Génère et télécharge un reçu PDF pour une réservation confirmée.
 * 
 * @param {Object} reservation - Les données de la réservation (id, spaceName, deskCode, deskType, deskPricePerHour, startTime, endTime)
 * @param {Object} currentUser - Les données de l'utilisateur (name, email)
 */
export const generateReceipt = (reservation, currentUser) => {
  const doc = new jsPDF();
  
  // Couleurs de la charte graphique CoWorkFlex
  const primaryColor = [16, 185, 129]; // emerald-500 (#10b981)
  const darkColor = [15, 23, 42]; // slate-900 (#0f172a)
  const lightGray = [241, 245, 249]; // slate-100 (#f1f5f9)

  // 1. En-tête (Bandeau coloré)
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('CoWorkFlex', 20, 25);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Reçu de Réservation', 150, 25);

  // 2. Infos Générales du Ticket
  doc.setTextColor(...darkColor);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Ticket de Réservation', 20, 60);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`N° de Réservation : #${reservation.id.substring(0, 8).toUpperCase()}`, 20, 70);
  doc.text(`Émis le : ${new Date().toLocaleDateString('fr-FR')}`, 20, 78);
  
  doc.text(`Statut :`, 140, 70);
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text(`VALIDÉ`, 160, 70);
  doc.setTextColor(...darkColor);

  // Ligne de séparation
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.5);
  doc.line(20, 85, 190, 85);

  // 3. Infos Client
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Détails du Client', 20, 100);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nom : ${currentUser.name || 'Utilisateur'}`, 20, 110);
  doc.text(`Email : ${currentUser.email}`, 20, 118);

  // 4. Infos Réservation (Encadré)
  doc.setFillColor(...lightGray);
  doc.rect(20, 130, 170, 65, 'F');
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Détails du Poste', 30, 145);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Espace : ${reservation.spaceName}`, 30, 155);
  doc.text(`Poste : ${reservation.deskCode} (${reservation.deskType})`, 30, 163);
  
  // Formatage des dates
  const startDate = new Date(reservation.startTime);
  const endDate = new Date(reservation.endTime);
  const dateStr = startDate.toLocaleDateString('fr-FR');
  const startStr = startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const endStr = endDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  
  doc.text(`Date : ${dateStr}`, 30, 171);
  doc.text(`Créneau : De ${startStr} à ${endStr}`, 30, 179);
  
  // Calcul du prix payé (approximatif basé sur la durée)
  const diffHours = (endDate - startDate) / (1000 * 60 * 60);
  const total = diffHours > 0 ? (diffHours * reservation.deskPricePerHour).toFixed(2) : '0.00';
  
  doc.setFont('helvetica', 'bold');
  doc.text(`Montant réglé : ${total} €`, 30, 187);

  // 5. Footer (Avertissement légal)
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // slate-500
  
  const footerText = [
    "Ce document sert de preuve de réservation.",
    "Veuillez le présenter à l'accueil de l'espace de coworking à votre arrivée.",
    "ATTENTION : Si cette réservation est annulée dans le système central par l'administration,",
    "ce reçu perdra automatiquement sa validité."
  ];
  
  let y = 230;
  footerText.forEach(line => {
    doc.text(line, 105, y, { align: 'center' });
    y += 6;
  });

  // Téléchargement du PDF
  doc.save(`CoWorkFlex_Recu_${reservation.id.substring(0, 8)}.pdf`);
};
