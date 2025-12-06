// ملف موحد للتعامل مع مصادقة جوجل
(function() {
    // تهيئة نظام تسجيل الدخول بحساب جوجل
    function initGoogleAuth() {
        // التحقق مما إذا كان المستخدم مسجلاً بالفعل
        const savedUser = localStorage.getItem('googleUser');
        if (savedUser) {
            const user = JSON.parse(savedUser);
            showUserInfo(user);
        }

        // إضافة مستمع الحدث لزر تسجيل الخروج
        const signOutBtn = document.getElementById('sign-out-btn');
        const customSignInBtn = document.getElementById('custom-signin-btn');

        if (signOutBtn) {
            signOutBtn.addEventListener('click', handleGoogleSignOut);
        }

        // إضافة مستمع الحدث للزر المخصص
        if (customSignInBtn) {
            customSignInBtn.addEventListener('click', () => {
                console.log('Custom sign-in button clicked');
                // استخدام طريقة Google Identity Services المباشرة
                if (window.google && window.google.accounts && window.google.accounts.id) {
                    console.log('Google Identity Services available, showing prompt...');
                    // عرض نافذة تسجيل الدخول
                    window.google.accounts.id.prompt((notification) => {
                        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                            // إذا لم يتم عرض النافذة، جرب طريقة أخرى
                            console.warn('Google Sign-In prompt was not displayed');
                            // محاولة عرض نافذة تسجيل الدخول يدوياً
                            try {
                                // محاولة استخدام الطريقة البديلة
                                window.google.accounts.id.prompt();
                            } catch (error) {
                                console.error('Error showing Google Sign-In prompt:', error);
                                alert('حدث خطأ أثناء محاولة عرض نافذة تسجيل الدخول. يرجى المحاولة مرة أخرى.');
                            }
                        }
                    });
                } else {
                    console.error('Google Identity Services not loaded');
                    alert('خدمات جوجل غير متاحة حالياً. يرجى تحديث الصفحة والمحاولة مرة أخرى.');
                }
            });
        } else {
            console.error('Custom sign-in button not found');
        }
    }

    // دالة معالجة رد تسجيل الدخول من Google Identity Platform
    function handleSignIn(response) {
        try {
            // التحقق من وجود الاستجابة والرمز
            if (!response || !response.credential) {
                console.error('Invalid response from Google Sign-In');
                return;
            }

            // فك تشفير رمز JWT
            const responsePayload = parseJwt(response.credential);

            if (!responsePayload || !responsePayload.name || !responsePayload.email) {
                console.error('Invalid payload in Google Sign-In response');
                return;
            }

            const user = {
                name: responsePayload.name,
                photo: responsePayload.picture,
                email: responsePayload.email
            };

            // حفظ بيانات المستخدم
            localStorage.setItem('googleUser', JSON.stringify(user));

            // عرض معلومات المستخدم
            showUserInfo(user);
        } catch (error) {
            console.error('Error during Google Sign-In:', error);
            alert('حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.');
        }
    }

    // دالة لفك تشفير رمز JWT
    function parseJwt(token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    }

    // معالجة تسجيل الخروج
    function handleGoogleSignOut() {
        // إزالة بيانات المستخدم من التخزين المحلي
        localStorage.removeItem('googleUser');

        // إخفاء معلومات المستخدم وعرض زر تسجيل الدخول
        const userInfo = document.getElementById('user-info');
        const signInBtn = document.getElementById('sign-in-btn');

        if (userInfo) {
            userInfo.style.display = 'none';
        }

        if (signInBtn) {
            signInBtn.style.display = 'block';
        }

        // يمكنك أيضاً إعادة تحميل الصفحة لمسح الجلسة بالكامل
        // window.location.reload();
    }

    // عرض معلومات المستخدم
    function showUserInfo(user) {
        const userInfo = document.getElementById('user-info');
        const userPhoto = document.getElementById('user-photo');
        const userName = document.getElementById('user-name');
        const signInBtn = document.getElementById('sign-in-btn');

        if (userInfo && userPhoto && userName && signInBtn) {
            // تعيين صورة واسم المستخدم
            userPhoto.src = user.photo;
            userName.textContent = user.name;

            // عرض معلومات المستخدم وإخفاء زر تسجيل الدخول
            userInfo.style.display = 'flex';
            signInBtn.style.display = 'none';
        }
    }

    // جعل الدوال متاحة عالمياً
    window.handleSignIn = handleSignIn;
    window.initGoogleAuth = initGoogleAuth;

    // تهيئة Google Identity Services
    function initializeGoogleAuth() {
        if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
            console.log('Initializing Google Identity Services...');

            // تهيئة Google Identity Services
            google.accounts.id.initialize({
                client_id: 'YOUR_CLIENT_ID.apps.googleusercontent.com',
                callback: handleSignIn,
                auto_select: false,
                cancel_on_tap_outside: false
            });

            // عرض زر تسجيل الدخول المخصص
            const signInButton = document.getElementById("sign-in-btn");
            if (signInButton) {
                google.accounts.id.renderButton(
                    signInButton,
                    { 
                        theme: "outline", 
                        size: "large",
                        text: "signin_with",
                        shape: "rectangular",
                        logo_alignment: "left"
                    }
                );
            } else {
                console.error('Sign-in button element not found');
            }

            // تهيئة نظام المصادقة
            initGoogleAuth();

            // عرض نافذة تسجيل الدخول تلقائياً للمستخدمين غير المسجلين
            google.accounts.id.prompt();
        } else {
            console.error('Google Identity Services library not loaded, retrying...');
            // إعادة المحاولة بعد فترة قصيرة
            setTimeout(initializeGoogleAuth, 1000);
        }
    }

    // التأكد من تحميل مكتبة جوجل قبل تهيئتها
    function checkGoogleLibrary() {
        if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
            console.log('Google Identity Services loaded successfully');
            initializeGoogleAuth();
        } else {
            console.error('Google Identity Services not loaded, waiting...');
            // الانتظار ثم التحقق مرة أخرى
            setTimeout(checkGoogleLibrary, 500);
        }
    }

    // بدء التحقق عند تحميل الصفحة
    window.addEventListener('load', checkGoogleLibrary);

    // إضافة مستمع لحدث تحميل مكتبة جوجل
    window.onGoogleLibraryLoad = function() {
        console.log('Google library load event fired');
        checkGoogleLibrary();
    };
})();
