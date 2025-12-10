import { motion } from 'framer-motion';
import { Droplets, Fish, CheckCircle } from 'lucide-react';

const steps = [
  {
    icon: Droplets,
    title: 'Выберите тип и размер',
    description: 'Определите объём, тип аквариума и стиль под ваш интерьер',
  },
  {
    icon: Fish,
    title: 'Подберите обитателей',
    description: 'Приложение покажет совместимость и даст рекомендации',
  },
  {
    icon: CheckCircle,
    title: 'Получите проект',
    description: 'Готовый расчёт и запуск аквариума от Bio-Cube под ключ',
  },
];

export const HowItWorksSection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      
      <div className="container px-4 md:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-foreground">Как это </span>
            <span className="text-gradient">работает</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Три простых шага от идеи до готового аквариума в вашем интерьере
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="relative"
            >
              {/* Connection line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-full w-full h-px bg-gradient-to-r from-primary/50 to-transparent z-0" />
              )}
              
              <div className="glass-card-hover p-8 text-center relative z-10 h-full">
                {/* Step number */}
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                
                {/* Icon */}
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>
                
                <h3 className="text-xl font-semibold mb-3 text-foreground">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
