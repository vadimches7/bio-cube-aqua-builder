import { useState } from 'react';
import { motion } from 'framer-motion';
import { AquariumConfig, AQUARIUM_TYPES, INTERIOR_STYLES } from '@/types/aquarium';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send, Filter, Thermometer, Sun, Droplets, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ConfiguratorStep3Props {
  config: AquariumConfig;
  onBack: () => void;
}

export const ConfiguratorStep3 = ({ config, onBack }: ConfiguratorStep3Props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    comment: '',
  });

  const typeInfo = AQUARIUM_TYPES.find(t => t.id === config.type);
  const styleInfo = INTERIOR_STYLES.find(s => s.id === config.interiorStyle);

  const totalFish = config.selectedFish.reduce((acc, sf) => acc + sf.count, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      toast.error('Заполните обязательные поля');
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setSubmitted(true);
    toast.success('Заявка отправлена! Мы свяжемся с вами в ближайшее время.');
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success/20 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-success" />
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-2">Заявка отправлена!</h3>
        <p className="text-muted-foreground mb-8">
          Специалисты Bio-Cube свяжутся с вами в течение рабочего дня
        </p>
        <Button variant="glass" onClick={onBack}>
          Создать новый проект
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold mb-2 text-foreground">Ваш проект готов!</h3>
        <p className="text-muted-foreground">
          Проверьте конфигурацию и отправьте заявку на запуск аквариума
        </p>
      </div>

      {/* Project summary */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Configuration summary */}
        <div className="p-6 rounded-2xl bg-card/50 border border-border/50">
          <h4 className="font-semibold text-foreground mb-4">Конфигурация</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Тип</span>
              <span className="font-medium text-foreground">{typeInfo?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Объём</span>
              <span className="font-medium text-foreground">{config.volume}L</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Стиль</span>
              <span className="font-medium text-foreground">{styleInfo?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Видов</span>
              <span className="font-medium text-foreground">{config.selectedFish.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Всего особей</span>
              <span className="font-medium text-foreground">{totalFish}</span>
            </div>
          </div>
        </div>

        {/* Equipment recommendations */}
        <div className="p-6 rounded-2xl bg-card/50 border border-border/50">
          <h4 className="font-semibold text-foreground mb-4">Рекомендуемое оборудование</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-card/50">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Filter className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="font-medium text-foreground">Внешний фильтр</div>
                <div className="text-xs text-muted-foreground">Производительность от {Math.round(config.volume * 4)} л/ч</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-card/50">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Thermometer className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="font-medium text-foreground">Нагреватель</div>
                <div className="text-xs text-muted-foreground">{Math.round(config.volume * 0.5)}W с терморегулятором</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-card/50">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Sun className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="font-medium text-foreground">LED освещение</div>
                <div className="text-xs text-muted-foreground">{config.type === 'planted' ? 'Полный спектр для растений' : 'Декоративное'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fish table */}
      <div className="overflow-hidden rounded-2xl border border-border/50">
        <table className="w-full">
          <thead className="bg-card/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Вид</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">Кол-во</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">Зона</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Сложность</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {config.selectedFish.map((sf) => (
              <tr key={sf.fish.id} className="bg-card/30">
                <td className="px-4 py-3">
                  <div className="font-medium text-foreground">{sf.fish.name}</div>
                  <div className="text-xs text-muted-foreground">{sf.fish.nameEn}</div>
                </td>
                <td className="px-4 py-3 text-center font-semibold text-foreground">{sf.count}</td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-card text-muted-foreground">
                    {sf.fish.zone === 'top' ? 'Верх' : sf.fish.zone === 'middle' ? 'Середина' : sf.fish.zone === 'bottom' ? 'Дно' : 'Все'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-sm text-muted-foreground">{sf.fish.careLevel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Contact form */}
      <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/20">
        <h4 className="font-semibold text-foreground mb-4">Получить расчёт и запуск</h4>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Имя *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-card/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:shadow-glow transition-all"
              placeholder="Как к вам обращаться"
            />
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Телефон *</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-card/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:shadow-glow transition-all"
              placeholder="+7 (___) ___-__-__"
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm text-muted-foreground mb-2">Комментарий</label>
          <textarea
            value={formData.comment}
            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 rounded-xl bg-card/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:shadow-glow transition-all resize-none"
            placeholder="Дополнительные пожелания"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button type="button" variant="glass" onClick={onBack}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Изменить
          </Button>
          <Button type="submit" variant="premium" size="lg" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? (
              'Отправка...'
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Получить расчёт от Bio-Cube
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
