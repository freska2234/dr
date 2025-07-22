// Theme toggle functionality
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

// Check for saved theme preference or default to light mode
const currentTheme = localStorage.getItem('theme') || 'light';
body.setAttribute('data-theme', currentTheme);
updateThemeToggle(currentTheme);

themeToggle.addEventListener('click', function() {
    const newTheme = body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeToggle(newTheme);
});

function updateThemeToggle(theme) {
    themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Header background change on scroll
window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    if (window.scrollY > 100) {
        header.style.background = body.getAttribute('data-theme') === 'dark' ? 'rgba(26, 26, 46, 0.98)' : 'rgba(255, 255, 255, 0.98)';
        header.style.backdropFilter = 'blur(25px)';
    } else {
        header.style.background = body.getAttribute('data-theme') === 'dark' ? 'rgba(26, 26, 46, 0.95)' : 'rgba(255, 255, 255, 0.95)';
        header.style.backdropFilter = 'blur(20px)';
    }
});

// Form submission handler
document.getElementById('appointmentForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const submitButton = this.querySelector('.submit-button');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'جاري الإرسال...';
    submitButton.disabled = true;

    // Get form data
    const formData = new FormData(this);
    const data = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        age: formData.get('age'),
        service: formData.get('service'),
        preferredDay: formData.get('preferred-day'),
        message: formData.get('message')
    };

    // Validate required fields
    if (!data.name || !data.phone || !data.service) {
        alert('يرجى ملء جميع الحقول المطلوبة');
        submitButton.textContent = originalText;
        submitButton.disabled = false;
        return;
    }

    // Prepare Telegram message
    const telegramMessage = `
🏥 طلب حجز موعد جديد

👤 الاسم: ${data.name}
📞 الهاتف: ${data.phone}
🎂 العمر: ${data.age || 'غير محدد'}
🩺 نوع الخدمة: ${getServiceName(data.service)}
📅 اليوم المفضل: ${getDayName(data.preferredDay)}
💬 ملاحظات: ${data.message || 'لا توجد ملاحظات'}

📋 تاريخ الطلب: ${new Date().toLocaleDateString('ar-EG')}
    `.trim();

    // Telegram Bot API configuration
    // ** هذا هو رمز البوت الخاص بك **
    const botToken = '7782544776:AAHc0yxlGBh5w2MSjIvWJ29ysKy4dkcINVE';
    // ** هذا هو الـ Chat ID الخاص بالمحادثة التي تريد استلام الرسائل فيها. تأكد من صحته! **
    const chatId = '614047663';

    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

    fetch(telegramApiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            chat_id: chatId,
            text: telegramMessage
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.ok) {
            document.getElementById('successMessage').style.display = 'block';
            this.reset(); // إعادة تعيين النموذج بعد الإرسال الناجح
            setTimeout(() => {
                document.getElementById('successMessage').style.display = 'none';
            }, 5000); // إخفاء رسالة النجاح بعد 5 ثواني
        } else {
            // التعامل مع أخطاء Telegram API
            alert('حدث خطأ أثناء إرسال طلب الحجز إلى التيليجرام: ' + data.description);
            console.error('Telegram API Error:', data);
        }
    })
    .catch(error => {
        // التعامل مع أخطاء الشبكة أو الـ fetch
        alert('حدث خطأ أثناء إرسال طلب الحجز: ' + error.message);
        console.error('Fetch Error:', error);
    })
    .finally(() => {
        // دائماً أعد تفعيل زر الإرسال
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    });
});

function getServiceName(serviceCode) {
    const services = {
        'consultation': 'استشارة عامة',
        'fertility': 'علاج العقم وتأخر الإنجاب',
        'pregnancy': 'متابعة الحمل',
        'delivery': 'الولادة',
        'gynecology': 'أمراض النساء',
        'surgery': 'جراحة نسائية',
        'ultrasound': 'سونار',
        'ivf': 'الحقن المجهري',
        'other': 'أخرى'
    };
    return services[serviceCode] || serviceCode;
}

function getDayName(dayCode) {
    const days = {
        'saturday': 'السبت',
        'sunday': 'الأحد',
        'monday': 'الاثنين',
        'tuesday': 'الثلاثاء',
        'wednesday': 'الأربعاء',
        'thursday': 'الخميس'
    };
    return days[dayCode] || 'غير محدد';
}

// Animate elements on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animationDelay = '0.2s';
            entry.target.style.animationFillMode = 'both';
            entry.target.style.animationName = 'fadeInUp';
            entry.target.style.animationDuration = '0.8s';
        }
    });
}, observerOptions);

// Observe service cards and other elements
document.querySelectorAll('.service-card, .about-text, .contact-info, .appointment-form').forEach(el => {
    observer.observe(el);
});

// Phone number formatting
document.getElementById('phone').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) {
        value = value.slice(0, 11);
    }
    e.target.value = value;
});
