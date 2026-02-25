/**
 * Falconhurst Cookie Consent
 * GDPR-compliant cookie consent banner with preference management.
 * Adapted from the ZZA compliance module for static site use.
 */
(function() {
    'use strict';

    var STORAGE_KEY = 'fh_cookie_consent';
    var GA_ID = 'G-WXFB5L04Y8';

    var defaults = {
        essential: true,
        functional: false,
        analytics: false
    };

    function getConsent() {
        try {
            var stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : null;
        } catch (e) {
            return null;
        }
    }

    function saveConsent(prefs) {
        var data = {
            essential: true,
            functional: !!prefs.functional,
            analytics: !!prefs.analytics,
            timestamp: new Date().toISOString(),
            version: 1
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        applyConsent(data);
        hideBanner();
    }

    function applyConsent(prefs) {
        if (prefs.analytics) {
            loadGoogleAnalytics();
        } else {
            removeAnalyticsCookies();
        }
    }

    function loadGoogleAnalytics() {
        if (document.querySelector('script[src*="googletagmanager"]')) return;

        window.dataLayer = window.dataLayer || [];
        function gtag() { window.dataLayer.push(arguments); }
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', GA_ID);

        var script = document.createElement('script');
        script.async = true;
        script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
        document.head.appendChild(script);
    }

    function removeAnalyticsCookies() {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var name = cookies[i].split('=')[0].trim();
            if (name.indexOf('_ga') === 0 || name === '_gid' || name === '_gat') {
                document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=' + location.hostname;
                document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.' + location.hostname;
            }
        }
    }

    function hideBanner() {
        var banner = document.getElementById('cookieConsent');
        if (banner) {
            banner.classList.remove('cc-visible');
            setTimeout(function() { banner.style.display = 'none'; }, 400);
        }
    }

    function showBanner() {
        var banner = document.getElementById('cookieConsent');
        if (banner) {
            banner.style.display = '';
            requestAnimationFrame(function() {
                requestAnimationFrame(function() {
                    banner.classList.add('cc-visible');
                });
            });
        }
    }

    function showPreferences() {
        var simple = document.getElementById('ccSimple');
        var detail = document.getElementById('ccDetail');
        if (simple) simple.style.display = 'none';
        if (detail) detail.style.display = '';
    }

    function showSimple() {
        var simple = document.getElementById('ccSimple');
        var detail = document.getElementById('ccDetail');
        if (simple) simple.style.display = '';
        if (detail) detail.style.display = 'none';
    }

    function createBanner() {
        var el = document.createElement('div');
        el.id = 'cookieConsent';
        el.className = 'cc-banner';
        el.setAttribute('role', 'dialog');
        el.setAttribute('aria-label', 'Cookie consent');
        el.innerHTML =
            '<div class="cc-inner">' +
                '<div id="ccSimple" class="cc-simple">' +
                    '<div class="cc-text">' +
                        '<p>We use cookies to improve your experience and analyse site traffic. ' +
                        'By clicking "Accept All", you consent to our use of cookies. ' +
                        '<a href="cookies.html">Cookie Policy</a></p>' +
                    '</div>' +
                    '<div class="cc-actions">' +
                        '<button class="cc-btn cc-btn-link" id="ccCustomise">Customise</button>' +
                        '<button class="cc-btn cc-btn-outline" id="ccReject">Reject All</button>' +
                        '<button class="cc-btn cc-btn-primary" id="ccAccept">Accept All</button>' +
                    '</div>' +
                '</div>' +
                '<div id="ccDetail" class="cc-detail" style="display:none">' +
                    '<div class="cc-detail-header">' +
                        '<h3>Cookie Preferences</h3>' +
                        '<button class="cc-close" id="ccClose" aria-label="Close preferences">&times;</button>' +
                    '</div>' +
                    '<div class="cc-categories">' +
                        '<div class="cc-category">' +
                            '<div class="cc-category-header">' +
                                '<span class="cc-category-name">Essential</span>' +
                                '<span class="cc-always-on">Always Active</span>' +
                            '</div>' +
                            '<p class="cc-category-desc">Required for the website to function properly. These cannot be disabled.</p>' +
                        '</div>' +
                        '<div class="cc-category">' +
                            '<div class="cc-category-header">' +
                                '<span class="cc-category-name">Functional</span>' +
                                '<label class="cc-toggle">' +
                                    '<input type="checkbox" id="ccFunctional">' +
                                    '<span class="cc-toggle-slider"></span>' +
                                '</label>' +
                            '</div>' +
                            '<p class="cc-category-desc">Remember your preferences such as language and region settings.</p>' +
                        '</div>' +
                        '<div class="cc-category">' +
                            '<div class="cc-category-header">' +
                                '<span class="cc-category-name">Analytics</span>' +
                                '<label class="cc-toggle">' +
                                    '<input type="checkbox" id="ccAnalytics">' +
                                    '<span class="cc-toggle-slider"></span>' +
                                '</label>' +
                            '</div>' +
                            '<p class="cc-category-desc">Help us understand how visitors use our website via Google Analytics. All data is anonymised.</p>' +
                        '</div>' +
                    '</div>' +
                    '<div class="cc-detail-footer">' +
                        '<a href="cookies.html" class="cc-policy-link">Cookie Policy</a>' +
                        '<div class="cc-detail-actions">' +
                            '<button class="cc-btn cc-btn-outline" id="ccRejectDetail">Reject All</button>' +
                            '<button class="cc-btn cc-btn-primary" id="ccSave">Save Preferences</button>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>';
        document.body.appendChild(el);

        document.getElementById('ccAccept').addEventListener('click', function() {
            saveConsent({ essential: true, functional: true, analytics: true });
        });
        document.getElementById('ccReject').addEventListener('click', function() {
            saveConsent(defaults);
        });
        document.getElementById('ccCustomise').addEventListener('click', showPreferences);
        document.getElementById('ccClose').addEventListener('click', showSimple);
        document.getElementById('ccRejectDetail').addEventListener('click', function() {
            saveConsent(defaults);
        });
        document.getElementById('ccSave').addEventListener('click', function() {
            saveConsent({
                essential: true,
                functional: document.getElementById('ccFunctional').checked,
                analytics: document.getElementById('ccAnalytics').checked
            });
        });
    }

    function init() {
        var consent = getConsent();
        if (consent) {
            applyConsent(consent);
        } else {
            createBanner();
            setTimeout(showBanner, 800);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
