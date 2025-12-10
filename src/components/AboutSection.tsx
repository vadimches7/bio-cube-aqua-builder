import { motion } from 'framer-motion';
import { Star, Shield, Clock, Microscope } from 'lucide-react';

export const AboutSection = () => {
  const features = [
    { icon: Star, text: '90+ отзывов 4.9★' },
    { icon: Shield, text: 'Гарантия 5 лет' },
    { icon: Clock, text: 'Экстренные выезды' },
    { icon: Microscope, text: 'Лабораторные тесты воды' },
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ocean-surface/20 to-transparent" />
      
      <div className="container px-4 md:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image/Visual */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-[4/3] rounded-3xl overflow-hidden glass-card">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-ocean-surface/30 to-accent/20">
                {/* Simulated aquarium interior */}
                <div className="absolute inset-8 rounded-2xl bg-ocean-deep/50">
                  {/* Light rays */}
                  <div className="absolute top-0 left-1/4 w-24 h-full bg-gradient-to-b from-primary/20 to-transparent blur-2xl" />
                  <div className="absolute top-0 right-1/3 w-16 h-full bg-gradient-to-b from-accent/15 to-transparent blur-2xl" />
                  
                  {/* Fish silhouettes */}
                  {[...Array(7)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-6 h-3 rounded-full bg-primary/30"
                      style={{
                        top: `${20 + i * 10}%`,
                        left: `${10 + i * 5}%`,
                      }}
                      animate={{
                        x: ['0%', '300%', '0%'],
                        y: [0, i % 2 === 0 ? 15 : -15, 0],
                      }}
                      transition={{
                        duration: 8 + i * 1.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: i * 0.5,
                      }}
                    />
                  ))}
                  
                  {/* Plants */}
                  <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-success/30 to-transparent" />
                </div>
              </div>
            </div>
            
            {/* Floating badge */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -right-4 -bottom-4 glass-card p-6"
            >
              <div className="text-4xl font-bold text-gradient">12+</div>
              <div className="text-sm text-muted-foreground">лет опыта</div>
            </motion.div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              <span className="text-foreground">О студии </span>
              <span className="text-gradient">Bio-Cube</span>
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Bio-Cube — студия премиального аквадизайна в Москве. Мы создаём аквариумы и палюдариумы 
              как часть интерьера, а не просто «банку с рыбой». Более 500 реализованных проектов, 
              работа по договору, полное сопровождение на всех этапах.
            </p>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 p-4 rounded-xl bg-card/50 border border-border/50"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{feature.text}</span>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <p className="text-muted-foreground">
              Запуск, обслуживание, экстренные выезды — всё включено в наши пакеты услуг.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
