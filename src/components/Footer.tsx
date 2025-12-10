import { Droplets, Phone, Mail, MapPin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="py-16 border-t border-border/50">
      <div className="container px-4 md:px-8">
        <div className="grid md:grid-cols-3 gap-12">
          {/* Logo and description */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Droplets className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">Bio-Cube</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Премиальная студия аквадизайна в Москве. Создаём аквариумы и палюдариумы как часть вашего интерьера.
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Услуги</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Запуск аквариумов под ключ</li>
              <li>Дизайн и проектирование</li>
              <li>Регулярное обслуживание</li>
              <li>Экстренные выезды</li>
              <li>Лабораторные тесты воды</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Контакты</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">Москва</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-primary" />
                <a href="tel:+79991234567" className="text-muted-foreground hover:text-foreground transition-colors">
                  +7 (999) 123-45-67
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-primary" />
                <a href="mailto:info@bio-cube.ru" className="text-muted-foreground hover:text-foreground transition-colors">
                  info@bio-cube.ru
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 Bio-Cube. Все права защищены.
          </p>
          <p className="text-sm text-muted-foreground">
            Запуск • Обслуживание • Экстренные выезды
          </p>
        </div>
      </div>
    </footer>
  );
};
