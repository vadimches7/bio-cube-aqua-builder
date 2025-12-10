import { motion } from 'framer-motion';
import { Trophy, Award, Zap, Shield, Star, Target } from 'lucide-react';

const badges = [
  { icon: Trophy, name: 'Идеальный запуск', description: 'Первый аквариум без потерь', color: 'from-yellow-500/30 to-amber-500/20' },
  { icon: Award, name: 'Мастер травников', description: '10+ успешных травников', color: 'from-emerald-500/30 to-green-500/20' },
  { icon: Shield, name: 'Без потерь 6 месяцев', description: 'Стабильная биосистема', color: 'from-blue-500/30 to-cyan-500/20' },
  { icon: Star, name: 'Premium клиент', description: 'Аквариум от 300L', color: 'from-purple-500/30 to-violet-500/20' },
  { icon: Zap, name: 'Быстрый старт', description: 'Запуск за 7 дней', color: 'from-orange-500/30 to-red-500/20' },
  { icon: Target, name: 'Эксперт', description: 'Все типы аквариумов', color: 'from-pink-500/30 to-rose-500/20' },
];

const levels = [
  { name: 'Новичок', progress: 0 },
  { name: 'Любитель', progress: 25 },
  { name: 'Опытный', progress: 50 },
  { name: 'Профи', progress: 75 },
  { name: 'Эксперт', progress: 100 },
];

export const GamificationSection = () => {
  const currentProgress = 35; // Example progress

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(175_85%_50%_/_0.03)_0%,transparent_70%)]" />
      
      <div className="container px-4 md:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-foreground">Путь </span>
            <span className="text-gradient">аквариумиста</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Развивайтесь вместе с Bio-Cube. Получайте достижения и открывайте новые возможности
          </p>
        </motion.div>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto mb-16"
        >
          <div className="glass-card p-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-foreground font-semibold">Ваш прогресс</span>
              <span className="text-gradient font-bold">Уровень: Любитель</span>
            </div>
            
            {/* Progress track */}
            <div className="relative mb-4">
              <div className="h-3 rounded-full bg-card overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-primary via-accent to-primary"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${currentProgress}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.3 }}
                />
              </div>
              
              {/* Level markers */}
              <div className="absolute -top-1 left-0 right-0 flex justify-between">
                {levels.map((level, i) => (
                  <div
                    key={i}
                    className={`w-5 h-5 rounded-full border-2 ${
                      currentProgress >= level.progress
                        ? 'bg-primary border-primary'
                        : 'bg-card border-border'
                    }`}
                    style={{ marginLeft: i === 0 ? 0 : -10 }}
                  />
                ))}
              </div>
            </div>
            
            {/* Level labels */}
            <div className="flex justify-between text-xs text-muted-foreground">
              {levels.map((level, i) => (
                <span key={i} className={currentProgress >= level.progress ? 'text-foreground' : ''}>
                  {level.name}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Badges grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {badges.map((badge, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="glass-card-hover p-6 text-center"
            >
              {/* Badge icon with metallic effect */}
              <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${badge.color} flex items-center justify-center border border-glass/20`}>
                <badge.icon className="w-8 h-8 text-foreground" />
              </div>
              
              <h4 className="font-semibold text-foreground text-sm mb-1">{badge.name}</h4>
              <p className="text-xs text-muted-foreground">{badge.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
