/**
 * Портфолио заказов — Скрипты
 */

(function() {
    'use strict';
    
    // Анимация появления элементов при загрузке
    document.addEventListener('DOMContentLoaded', function() {
        const items = document.querySelectorAll('.portfolio-item');
        
        items.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, index * 150);
        });
        
        console.log('📼 Портфолио загружено');
    });
    
})();
