import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportAnalyticsPDF = ({
  days,
  customStartDate,
  customEndDate,
  viewMode,
  globalStats,
  networkStats
}) => {
  const doc = new jsPDF();
  
  // Título
  doc.setFontSize(18);
  doc.text("Reporte de Analíticas - Tarjetoso", 14, 22);
  
  // Periodo
  doc.setFontSize(11);
  let periodText = "";
  if (days === 'custom') {
    periodText = `Periodo: ${customStartDate} al ${customEndDate}`;
  } else {
    periodText = `Periodo: Últimos ${days} días`;
  }
  doc.text(periodText, 14, 30);
  doc.text(`Modo: ${viewMode === 'global' ? 'Toda la aplicación' : 'Comparativa de Negocios'}`, 14, 36);
  
  // Resumen Global
  doc.text(`Total Visitas: ${globalStats.totalVisitas}`, 14, 46);
  doc.text(`Total Contactos a Redes/WhatsApp: ${globalStats.totalContactos}`, 14, 52);
  
  // Tablas Separadas por Negocio
  if (networkStats.length > 0) {
    let finalY = 60;
    
    networkStats.forEach(stat => {
      // Título del Negocio
      doc.setFontSize(14);
      doc.setTextColor(30, 61, 81); // #1A535C
      doc.text(`Negocio: ${stat.business.name}`, 14, finalY);
      finalY += 6;

      // Tabla de Interacciones
      const metricsHead = [["Métrica / Plataforma", "Total Clics / Visitas"]];
      const metricsBody = [
        ["Visitas al Perfil", stat.visitas]
      ];
      
      if (Object.keys(stat.redes).length > 0) {
        Object.entries(stat.redes).sort((a,b) => b[1]-a[1]).forEach(([plat, count]) => {
          metricsBody.push([plat.charAt(0).toUpperCase() + plat.slice(1), count]);
        });
      }
      
      autoTable(doc, {
        head: metricsHead,
        body: metricsBody,
        startY: finalY,
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [30, 61, 81] }
      });
      
      finalY = doc.lastAutoTable.finalY + 8;

      // Tabla de Usuarios Únicos (Si existen)
      if (stat.users && stat.users.size > 0) {
        doc.setFontSize(11);
        doc.text(`Usuarios Registrados que interactuaron (${stat.users.size}):`, 14, finalY);
        finalY += 6;
        
        const usersHead = [["Nombre de Usuario", "Teléfono"]];
        const usersBody = Array.from(stat.users.values()).map(u => [
          u.is_owner ? `${u.name} (Dueño)` : u.name, 
          u.phone
        ]);
        
        autoTable(doc, {
          head: usersHead,
          body: usersBody,
          startY: finalY,
          styles: { fontSize: 9, cellPadding: 2 },
          headStyles: { fillColor: [249, 132, 44] } // Naranja (Secundario)
        });
        
        finalY = doc.lastAutoTable.finalY + 15;
      } else {
        finalY += 10;
      }
    });
  }
  
  doc.save("Reporte_Analiticas_Tarjetoso.pdf");
};
