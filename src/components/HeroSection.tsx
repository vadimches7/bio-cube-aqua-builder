import { motion } from 'framer-motion';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

interface HeroSectionProps {
  onOpenConfigurator: () => void;
}

export const HeroSection = ({ onOpenConfigurator }: HeroSectionProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-ocean">
        {/* Water caustics effect */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_20%_30%,hsl(175_85%_50%_/_0.15)_0%,transparent_50%)]" />
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_80%_60%,hsl(185_80%_45%_/_0.1)_0%,transparent_50%)]" />
          <div className="absolute bottom-0 left-1/2 w-full h-full bg-[radial-gradient(ellipse_at_50%_90%,hsl(200_60%_30%_/_0.2)_0%,transparent_40%)]" />
        </div>
        
        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-primary/30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 4 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="container relative z-10 px-4 md:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Text */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 border border-primary/20 backdrop-blur-sm mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm text-muted-foreground">Bio-Cube • Москва • 12+ лет опыта</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-6"
            >
              <span className="text-foreground">Собери свой</span>
              <br />
              <span className="text-gradient">идеальный аквариум</span>
              <br />
              <span className="text-foreground">онлайн</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-xl text-muted-foreground max-w-xl mb-10"
            >
              Приложение подбирает рыб и совместимость. Bio-Cube запускает 
              аквариум в вашем интерьере под ключ.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button 
                variant="premium" 
                size="xl"
                onClick={onOpenConfigurator}
                className="group"
              >
                Собрать аквариум
                <motion.span
                  className="inline-block"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </Button>
              <Button variant="glass" size="lg">
                Посмотреть работы
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex items-center gap-8 mt-12 justify-center lg:justify-start"
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-gradient">90+</div>
                <div className="text-sm text-muted-foreground">Отзывов 4.9★</div>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <div className="text-3xl font-bold text-gradient">500+</div>
                <div className="text-sm text-muted-foreground">Проектов</div>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <div className="text-3xl font-bold text-gradient">5 лет</div>
                <div className="text-sm text-muted-foreground">Гарантия</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right side - Aquarium visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative hidden lg:block"
          >
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden">
              {/* Glass effect container */}
              <div className="absolute inset-0 glass-card water-shimmer">
                {/* Background video */}
                <video
                  ref={videoRef}
                  src="/video-2.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-4 rounded-2xl w-[calc(100%-2rem)] h-[calc(100%-2rem)] object-cover z-0"
                />
                
                {/* Overlay effects for better integration */}
                <div className="absolute inset-4 rounded-2xl bg-gradient-to-b from-transparent via-transparent to-ocean-deep/20 z-1 pointer-events-none" />
                
                {/* Light rays overlay */}
                <div className="absolute inset-4 rounded-2xl top-0 left-1/4 w-1/2 h-full bg-gradient-to-b from-primary/10 to-transparent blur-xl z-1 pointer-events-none" />
                
                {/* Glass reflection */}
                <div className="absolute inset-4 rounded-2xl top-0 left-0 w-1/3 h-full bg-gradient-to-r from-glass/5 to-transparent z-1 pointer-events-none" />
              </div>
              
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-transparent to-accent/20 blur-3xl -z-10" />
            </div>
            
            {/* Floating badge */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -right-4 top-1/4 glass-card p-4"
            >
              <div className="text-sm text-muted-foreground">Объём</div>
              <div className="text-2xl font-bold text-gradient">300L</div>
            </motion.div>
            
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="absolute -left-4 bottom-1/4 glass-card p-4"
            >
              <div className="text-sm text-muted-foreground">Стиль</div>
              <div className="text-lg font-semibold text-foreground">Минимализм</div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-2 cursor-pointer"
          onClick={onOpenConfigurator}
        >
          <span className="text-sm text-muted-foreground">Начать</span>
          <ChevronDown className="w-5 h-5 text-primary" />
        </motion.div>
      </motion.div>
    </section>
  );
};
