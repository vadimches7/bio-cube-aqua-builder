import { AquariumConfig, AQUARIUM_TYPES, INTERIOR_STYLES } from '@/types/aquarium';
import { getOptimalWaterParams } from './waterParamsChecker';

/**
 * Экспорт конфигурации в JSON
 */
export function exportToJSON(config: AquariumConfig): void {
  const exportData = {
    version: '1.0',
    createdAt: new Date().toISOString(),
    config: {
      type: config.type,
      volume: config.volume,
      experienceLevel: config.experienceLevel,
      interiorStyle: config.interiorStyle,
      selectedFish: config.selectedFish.map(sf => ({
        id: sf.fish.id,
        name: sf.fish.name,
        nameEn: sf.fish.nameEn,
        count: sf.count,
        minVolume: sf.fish.minVolume,
        zone: sf.fish.zone,
        temperament: sf.fish.temperament,
        schooling: sf.fish.schooling,
        minSchoolSize: sf.fish.minSchoolSize,
        waterParams: sf.fish.waterParams,
        familyGroup: sf.fish.familyGroup,
      })),
      optimalWaterParams: getOptimalWaterParams(config.selectedFish),
    },
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `bio-cube-aquarium-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Экспорт конфигурации в текстовый формат
 */
export function exportToText(config: AquariumConfig): void {
  const typeInfo = AQUARIUM_TYPES.find(t => t.id === config.type);
  const styleInfo = INTERIOR_STYLES.find(s => s.id === config.interiorStyle);
  const optimalWaterParams = getOptimalWaterParams(config.selectedFish);
  const totalFish = config.selectedFish.reduce((acc, sf) => acc + sf.count, 0);

  let text = '='.repeat(60) + '\n';
  text += 'КОНФИГУРАЦИЯ АКВАРИУМА BIO-CUBE\n';
  text += '='.repeat(60) + '\n\n';
  
  text += `Дата создания: ${new Date().toLocaleString('ru-RU')}\n\n`;
  
  text += 'ОСНОВНЫЕ ПАРАМЕТРЫ\n';
  text += '-'.repeat(60) + '\n';
  text += `Тип аквариума: ${typeInfo?.name || config.type}\n`;
  text += `Объём: ${config.volume} литров\n`;
  text += `Уровень опыта: ${config.experienceLevel === 'beginner' ? 'Новичок' : config.experienceLevel === 'intermediate' ? 'Уже разбираюсь' : 'Продвинутый'}\n`;
  text += `Стиль интерьера: ${styleInfo?.name || config.interiorStyle}\n\n`;
  
  if (optimalWaterParams) {
    text += 'РЕКОМЕНДУЕМЫЕ ПАРАМЕТРЫ ВОДЫ\n';
    text += '-'.repeat(60) + '\n';
    if (optimalWaterParams.phMin !== undefined && optimalWaterParams.phMax !== undefined) {
      text += `pH: ${optimalWaterParams.phMin.toFixed(1)} - ${optimalWaterParams.phMax.toFixed(1)}\n`;
    }
    if (optimalWaterParams.tempMin !== undefined && optimalWaterParams.tempMax !== undefined) {
      text += `Температура: ${optimalWaterParams.tempMin} - ${optimalWaterParams.tempMax}°C\n`;
    }
    text += '\n';
  }
  
  text += 'ОБИТАТЕЛИ\n';
  text += '-'.repeat(60) + '\n';
  text += `Всего видов: ${config.selectedFish.length}\n`;
  text += `Всего особей: ${totalFish}\n\n`;
  
  config.selectedFish.forEach((sf, index) => {
    text += `${index + 1}. ${sf.fish.name} (${sf.fish.nameEn})\n`;
    text += `   Количество: ${sf.count} особей\n`;
    text += `   Зона: ${sf.fish.zone === 'top' ? 'Верх' : sf.fish.zone === 'middle' ? 'Середина' : sf.fish.zone === 'bottom' ? 'Дно' : 'Все'}\n`;
    text += `   Темперамент: ${sf.fish.temperament === 'peaceful' ? 'Мирная' : sf.fish.temperament === 'semi-aggressive' ? 'Полуагрессивная' : 'Агрессивная'}\n`;
    if (sf.fish.schooling) {
      text += `   Стайная рыба (минимум ${sf.fish.minSchoolSize || 6} особей)\n`;
    }
    if (sf.fish.familyGroup) {
      text += `   Семейство: ${sf.fish.familyGroup}\n`;
    }
    if (sf.fish.waterParams) {
      const params: string[] = [];
      if (sf.fish.waterParams.phMin !== undefined && sf.fish.waterParams.phMax !== undefined) {
        params.push(`pH ${sf.fish.waterParams.phMin.toFixed(1)}-${sf.fish.waterParams.phMax.toFixed(1)}`);
      }
      if (sf.fish.waterParams.tempMin !== undefined && sf.fish.waterParams.tempMax !== undefined) {
        params.push(`${sf.fish.waterParams.tempMin}-${sf.fish.waterParams.tempMax}°C`);
      }
      if (params.length > 0) {
        text += `   Параметры воды: ${params.join(', ')}\n`;
      }
    }
    text += '\n';
  });
  
  text += 'РЕКОМЕНДУЕМОЕ ОБОРУДОВАНИЕ\n';
  text += '-'.repeat(60) + '\n';
  text += `Внешний фильтр: производительность от ${Math.round(config.volume * 4)} л/ч\n`;
  text += `Нагреватель: ${Math.round(config.volume * 0.5)}W с терморегулятором\n`;
  text += `LED освещение: ${config.type === 'planted' ? 'Полный спектр для растений' : 'Декоративное'}\n\n`;
  
  text += '='.repeat(60) + '\n';
  text += 'Создано с помощью Bio-Cube Aquarium Configurator\n';
  text += 'https://bio-cube.ru\n';
  text += '='.repeat(60);

  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `bio-cube-aquarium-${new Date().toISOString().split('T')[0]}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Экспорт конфигурации в PDF (простая версия через print)
 */
export function exportToPDF(config: AquariumConfig): void {
  // Создаем временный элемент для печати
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Пожалуйста, разрешите всплывающие окна для экспорта в PDF');
    return;
  }

  const typeInfo = AQUARIUM_TYPES.find(t => t.id === config.type);
  const styleInfo = INTERIOR_STYLES.find(s => s.id === config.interiorStyle);
  const optimalWaterParams = getOptimalWaterParams(config.selectedFish);
  const totalFish = config.selectedFish.reduce((acc, sf) => acc + sf.count, 0);

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Конфигурация аквариума Bio-Cube</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          color: #333;
        }
        h1 {
          color: #0ea5e9;
          border-bottom: 3px solid #0ea5e9;
          padding-bottom: 10px;
        }
        h2 {
          color: #64748b;
          margin-top: 30px;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 5px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th, td {
          padding: 10px;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
        }
        th {
          background-color: #f1f5f9;
          font-weight: bold;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #f1f5f9;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #e2e8f0;
          text-align: center;
          color: #64748b;
          font-size: 12px;
        }
        @media print {
          body { margin: 0; }
          @page { margin: 1cm; }
        }
      </style>
    </head>
    <body>
      <h1>Конфигурация аквариума Bio-Cube</h1>
      <p><strong>Дата создания:</strong> ${new Date().toLocaleString('ru-RU')}</p>
      
      <h2>Основные параметры</h2>
      <div class="info-row">
        <span>Тип аквариума:</span>
        <span><strong>${typeInfo?.name || config.type}</strong></span>
      </div>
      <div class="info-row">
        <span>Объём:</span>
        <span><strong>${config.volume} литров</strong></span>
      </div>
      <div class="info-row">
        <span>Уровень опыта:</span>
        <span><strong>${config.experienceLevel === 'beginner' ? 'Новичок' : config.experienceLevel === 'intermediate' ? 'Уже разбираюсь' : 'Продвинутый'}</strong></span>
      </div>
      <div class="info-row">
        <span>Стиль интерьера:</span>
        <span><strong>${styleInfo?.name || config.interiorStyle}</strong></span>
      </div>
  `;

  if (optimalWaterParams) {
    html += `
      <h2>Рекомендуемые параметры воды</h2>
    `;
    if (optimalWaterParams.phMin !== undefined && optimalWaterParams.phMax !== undefined) {
      html += `
        <div class="info-row">
          <span>pH:</span>
          <span><strong>${optimalWaterParams.phMin.toFixed(1)} - ${optimalWaterParams.phMax.toFixed(1)}</strong></span>
        </div>
      `;
    }
    if (optimalWaterParams.tempMin !== undefined && optimalWaterParams.tempMax !== undefined) {
      html += `
        <div class="info-row">
          <span>Температура:</span>
          <span><strong>${optimalWaterParams.tempMin} - ${optimalWaterParams.tempMax}°C</strong></span>
        </div>
      `;
    }
  }

  html += `
      <h2>Обитатели</h2>
      <p><strong>Всего видов:</strong> ${config.selectedFish.length} | <strong>Всего особей:</strong> ${totalFish}</p>
      <table>
        <thead>
          <tr>
            <th>Вид</th>
            <th>Количество</th>
            <th>Зона</th>
            <th>Темперамент</th>
            <th>Особенности</th>
          </tr>
        </thead>
        <tbody>
  `;

  config.selectedFish.forEach(sf => {
    const features: string[] = [];
    if (sf.fish.schooling) {
      features.push(`Стайная (мин. ${sf.fish.minSchoolSize || 6})`);
    }
    if (sf.fish.familyGroup) {
      features.push(sf.fish.familyGroup);
    }
    
    html += `
          <tr>
            <td><strong>${sf.fish.name}</strong><br><small>${sf.fish.nameEn}</small></td>
            <td>${sf.count}</td>
            <td>${sf.fish.zone === 'top' ? 'Верх' : sf.fish.zone === 'middle' ? 'Середина' : sf.fish.zone === 'bottom' ? 'Дно' : 'Все'}</td>
            <td>${sf.fish.temperament === 'peaceful' ? 'Мирная' : sf.fish.temperament === 'semi-aggressive' ? 'Полуагрессивная' : 'Агрессивная'}</td>
            <td>${features.join(', ') || '-'}</td>
          </tr>
    `;
  });

  html += `
        </tbody>
      </table>
      
      <h2>Рекомендуемое оборудование</h2>
      <div class="info-row">
        <span>Внешний фильтр:</span>
        <span><strong>Производительность от ${Math.round(config.volume * 4)} л/ч</strong></span>
      </div>
      <div class="info-row">
        <span>Нагреватель:</span>
        <span><strong>${Math.round(config.volume * 0.5)}W с терморегулятором</strong></span>
      </div>
      <div class="info-row">
        <span>LED освещение:</span>
        <span><strong>${config.type === 'planted' ? 'Полный спектр для растений' : 'Декоративное'}</strong></span>
      </div>
      
      <div class="footer">
        <p>Создано с помощью Bio-Cube Aquarium Configurator</p>
        <p>https://bio-cube.ru</p>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  
  // Ждем загрузки и открываем диалог печати
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };
}
