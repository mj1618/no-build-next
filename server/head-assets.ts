/**
 * All CSS stylesheets, inline styles, and scripts extracted from the
 * original Next.js SiteLayoutWithHtml <head> so they can be served
 * in the no-build HTML shell.
 */

export function getHeadAssets(): string {
  return `
  <link rel="stylesheet" id="brew_newsletter_style-css" href="/wp-content/plugins/brew-newsletter-modal/includes/public/styles.min.css@ver=1.0.css" type="text/css" media="all" />
  <link rel="stylesheet" id="start_banner_style-css" href="/wp-content/plugins/start-banner/includes/public/styles.min.css@ver=1.0.css" type="text/css" media="all" />
  <link rel="stylesheet" id="woocommerce-layout-css" href="/wp-content/plugins/woocommerce/assets/css/woocommerce-layout.css@ver=10.3.6.css" type="text/css" media="all" />
  <link rel="stylesheet" id="woocommerce-smallscreen-css" href="/wp-content/plugins/woocommerce/assets/css/woocommerce-smallscreen.css@ver=10.3.6.css" type="text/css" media="only screen and (max-width: 768px)" />
  <link rel="stylesheet" id="woocommerce-general-css" href="/wp-content/plugins/woocommerce/assets/css/woocommerce.css@ver=10.3.6.css" type="text/css" media="all" />
  <link rel="stylesheet" id="brands-styles-css" href="/wp-content/plugins/woocommerce/assets/css/brands.css@ver=10.3.6.css" type="text/css" media="all" />
  <link rel="stylesheet" id="startdigital-css" href="/wp-content/themes/startdigital/static/style.css@ver=1741740486.css" type="text/css" media="all" />
  <link rel="stylesheet" id="fonts-css" href="https://use.typekit.net/gzw0jmm.css?ver=6.9" type="text/css" media="all" />
  <link rel="stylesheet" id="swiper-css" href="https://cdn.jsdelivr.net/npm/swiper@8/swiper-bundle.min.css?ver=6.9" type="text/css" media="all" />
  <link rel="stylesheet" id="wc-blocks-style-css" href="/wp-content/plugins/woocommerce/assets/client/blocks/wc-blocks.css@ver=wc-10.3.6.css" type="text/css" media="all" />

  <style id="wp-img-auto-sizes-contain-inline-css" type="text/css">
    img:is([sizes=auto i], [sizes^="auto," i]) { contain-intrinsic-size: 3000px 1500px }
  </style>

  <style id="wp-emoji-styles-inline-css" type="text/css">
    img.wp-smiley, img.emoji {
      display: inline !important; border: none !important; box-shadow: none !important;
      height: 1em !important; width: 1em !important; margin: 0 0.07em !important;
      vertical-align: -0.1em !important; background: none !important; padding: 0 !important;
    }
  </style>

  <style id="wp-block-library-inline-css" type="text/css">
    :root {
      --wp-block-synced-color: #7a00df; --wp-block-synced-color--rgb: 122, 0, 223;
      --wp-bound-block-color: var(--wp-block-synced-color);
      --wp-editor-canvas-background: #ddd;
      --wp-admin-theme-color: #007cba; --wp-admin-theme-color--rgb: 0, 124, 186;
      --wp-admin-theme-color-darker-10: #006ba1; --wp-admin-theme-color-darker-10--rgb: 0, 107, 160.5;
      --wp-admin-theme-color-darker-20: #005a87; --wp-admin-theme-color-darker-20--rgb: 0, 90, 135;
      --wp-admin-border-width-focus: 2px;
    }
    @media (min-resolution:192dpi) { :root { --wp-admin-border-width-focus: 1.5px } }
    .wp-element-button { cursor: pointer }
    :root .has-very-light-gray-background-color { background-color: #eee }
    :root .has-very-dark-gray-background-color { background-color: #313131 }
    :root .has-very-light-gray-color { color: #eee }
    :root .has-very-dark-gray-color { color: #313131 }
    :root { --wp--preset--font-size--normal: 16px; --wp--preset--font-size--huge: 42px }
    .has-regular-font-size { font-size: 1em }
    .has-larger-font-size { font-size: 2.625em }
    .has-normal-font-size { font-size: var(--wp--preset--font-size--normal) }
    .has-huge-font-size { font-size: var(--wp--preset--font-size--huge) }
    .has-text-align-center { text-align: center }
    .has-text-align-left { text-align: left }
    .has-text-align-right { text-align: right }
    .has-fit-text { white-space: nowrap !important }
    #end-resizable-editor-section { display: none }
    .aligncenter { clear: both }
    .items-justified-left { justify-content: flex-start }
    .items-justified-center { justify-content: center }
    .items-justified-right { justify-content: flex-end }
    .items-justified-space-between { justify-content: space-between }
    .screen-reader-text { border:0; clip-path:inset(50%); height:1px; margin:-1px; overflow:hidden; padding:0; position:absolute; width:1px; word-wrap:normal !important }
    .screen-reader-text:focus { background-color:#ddd; clip-path:none; color:#444; display:block; font-size:1em; height:auto; left:5px; line-height:normal; padding:15px 23px 14px; text-decoration:none; top:5px; width:auto; z-index:100000 }
    html :where(.has-border-color) { border-style: solid }
    html :where([style*=border-top-color]) { border-top-style: solid }
    html :where([style*=border-right-color]) { border-right-style: solid }
    html :where([style*=border-bottom-color]) { border-bottom-style: solid }
    html :where([style*=border-left-color]) { border-left-style: solid }
    html :where([style*=border-width]) { border-style: solid }
    html :where([style*=border-top-width]) { border-top-style: solid }
    html :where([style*=border-right-width]) { border-right-style: solid }
    html :where([style*=border-bottom-width]) { border-bottom-style: solid }
    html :where([style*=border-left-width]) { border-left-style: solid }
    html :where(img[class*=wp-image-]) { height: auto; max-width: 100% }
    :where(figure) { margin: 0 0 1em }
    html :where(.is-position-sticky) { --wp-admin--admin-bar--position-offset: var(--wp-admin--admin-bar--height, 0px) }
    @media screen and (max-width:600px) { html :where(.is-position-sticky) { --wp-admin--admin-bar--position-offset: 0px } }
  </style>

  <style id="global-styles-inline-css" type="text/css">
    :root {
      --wp--preset--aspect-ratio--square: 1; --wp--preset--aspect-ratio--4-3: 4/3;
      --wp--preset--aspect-ratio--3-4: 3/4; --wp--preset--aspect-ratio--3-2: 3/2;
      --wp--preset--aspect-ratio--2-3: 2/3; --wp--preset--aspect-ratio--16-9: 16/9;
      --wp--preset--aspect-ratio--9-16: 9/16;
      --wp--preset--color--black: #000000; --wp--preset--color--cyan-bluish-gray: #abb8c3;
      --wp--preset--color--white: #ffffff; --wp--preset--color--pale-pink: #f78da7;
      --wp--preset--color--vivid-red: #cf2e2e; --wp--preset--color--luminous-vivid-orange: #ff6900;
      --wp--preset--color--luminous-vivid-amber: #fcb900; --wp--preset--color--light-green-cyan: #7bdcb5;
      --wp--preset--color--vivid-green-cyan: #00d084; --wp--preset--color--pale-cyan-blue: #8ed1fc;
      --wp--preset--color--vivid-cyan-blue: #0693e3; --wp--preset--color--vivid-purple: #9b51e0;
      --wp--preset--gradient--vivid-cyan-blue-to-vivid-purple: linear-gradient(135deg,rgb(6,147,227) 0%,rgb(155,81,224) 100%);
      --wp--preset--gradient--light-green-cyan-to-vivid-green-cyan: linear-gradient(135deg,rgb(122,220,180) 0%,rgb(0,208,130) 100%);
      --wp--preset--gradient--luminous-vivid-amber-to-luminous-vivid-orange: linear-gradient(135deg,rgb(252,185,0) 0%,rgb(255,105,0) 100%);
      --wp--preset--gradient--luminous-vivid-orange-to-vivid-red: linear-gradient(135deg,rgb(255,105,0) 0%,rgb(207,46,46) 100%);
      --wp--preset--gradient--very-light-gray-to-cyan-bluish-gray: linear-gradient(135deg,rgb(238,238,238) 0%,rgb(169,184,195) 100%);
      --wp--preset--gradient--cool-to-warm-spectrum: linear-gradient(135deg,rgb(74,234,220) 0%,rgb(151,120,209) 20%,rgb(207,42,186) 40%,rgb(238,44,130) 60%,rgb(251,105,98) 80%,rgb(254,248,76) 100%);
      --wp--preset--gradient--blush-light-purple: linear-gradient(135deg,rgb(255,206,236) 0%,rgb(152,150,240) 100%);
      --wp--preset--gradient--blush-bordeaux: linear-gradient(135deg,rgb(254,205,165) 0%,rgb(254,45,45) 50%,rgb(107,0,62) 100%);
      --wp--preset--gradient--luminous-dusk: linear-gradient(135deg,rgb(255,203,112) 0%,rgb(199,81,192) 50%,rgb(65,88,208) 100%);
      --wp--preset--gradient--pale-ocean: linear-gradient(135deg,rgb(255,245,203) 0%,rgb(182,227,212) 50%,rgb(51,167,181) 100%);
      --wp--preset--gradient--electric-grass: linear-gradient(135deg,rgb(202,248,128) 0%,rgb(113,206,126) 100%);
      --wp--preset--gradient--midnight: linear-gradient(135deg,rgb(2,3,129) 0%,rgb(40,116,252) 100%);
      --wp--preset--font-size--small: 13px; --wp--preset--font-size--medium: 20px;
      --wp--preset--font-size--large: 36px; --wp--preset--font-size--x-large: 42px;
      --wp--preset--spacing--20: 0.44rem; --wp--preset--spacing--30: 0.67rem;
      --wp--preset--spacing--40: 1rem; --wp--preset--spacing--50: 1.5rem;
      --wp--preset--spacing--60: 2.25rem; --wp--preset--spacing--70: 3.38rem;
      --wp--preset--spacing--80: 5.06rem;
      --wp--preset--shadow--natural: 6px 6px 9px rgba(0,0,0,0.2);
      --wp--preset--shadow--deep: 12px 12px 50px rgba(0,0,0,0.4);
      --wp--preset--shadow--sharp: 6px 6px 0px rgba(0,0,0,0.2);
      --wp--preset--shadow--outlined: 6px 6px 0px -3px rgb(255,255,255), 6px 6px rgb(0,0,0);
      --wp--preset--shadow--crisp: 6px 6px 0px rgb(0,0,0);
    }
    :where(.is-layout-flex) { gap: 0.5em }
    :where(.is-layout-grid) { gap: 0.5em }
    body .is-layout-flex { display: flex }
    .is-layout-flex { flex-wrap: wrap; align-items: center }
    .is-layout-flex>:is(*,div) { margin: 0 }
    body .is-layout-grid { display: grid }
    .is-layout-grid>:is(*,div) { margin: 0 }
    :where(.wp-block-columns.is-layout-flex) { gap: 2em }
    :where(.wp-block-columns.is-layout-grid) { gap: 2em }
    :where(.wp-block-post-template.is-layout-flex) { gap: 1.25em }
    :where(.wp-block-post-template.is-layout-grid) { gap: 1.25em }
    .has-black-color { color: var(--wp--preset--color--black) !important }
    .has-cyan-bluish-gray-color { color: var(--wp--preset--color--cyan-bluish-gray) !important }
    .has-white-color { color: var(--wp--preset--color--white) !important }
    .has-pale-pink-color { color: var(--wp--preset--color--pale-pink) !important }
    .has-vivid-red-color { color: var(--wp--preset--color--vivid-red) !important }
    .has-luminous-vivid-orange-color { color: var(--wp--preset--color--luminous-vivid-orange) !important }
    .has-luminous-vivid-amber-color { color: var(--wp--preset--color--luminous-vivid-amber) !important }
    .has-light-green-cyan-color { color: var(--wp--preset--color--light-green-cyan) !important }
    .has-vivid-green-cyan-color { color: var(--wp--preset--color--vivid-green-cyan) !important }
    .has-pale-cyan-blue-color { color: var(--wp--preset--color--pale-cyan-blue) !important }
    .has-vivid-cyan-blue-color { color: var(--wp--preset--color--vivid-cyan-blue) !important }
    .has-vivid-purple-color { color: var(--wp--preset--color--vivid-purple) !important }
    .has-black-background-color { background-color: var(--wp--preset--color--black) !important }
    .has-cyan-bluish-gray-background-color { background-color: var(--wp--preset--color--cyan-bluish-gray) !important }
    .has-white-background-color { background-color: var(--wp--preset--color--white) !important }
    .has-pale-pink-background-color { background-color: var(--wp--preset--color--pale-pink) !important }
    .has-vivid-red-background-color { background-color: var(--wp--preset--color--vivid-red) !important }
    .has-luminous-vivid-orange-background-color { background-color: var(--wp--preset--color--luminous-vivid-orange) !important }
    .has-luminous-vivid-amber-background-color { background-color: var(--wp--preset--color--luminous-vivid-amber) !important }
    .has-light-green-cyan-background-color { background-color: var(--wp--preset--color--light-green-cyan) !important }
    .has-vivid-green-cyan-background-color { background-color: var(--wp--preset--color--vivid-green-cyan) !important }
    .has-pale-cyan-blue-background-color { background-color: var(--wp--preset--color--pale-cyan-blue) !important }
    .has-vivid-cyan-blue-background-color { background-color: var(--wp--preset--color--vivid-cyan-blue) !important }
    .has-vivid-purple-background-color { background-color: var(--wp--preset--color--vivid-purple) !important }
    .has-black-border-color { border-color: var(--wp--preset--color--black) !important }
    .has-cyan-bluish-gray-border-color { border-color: var(--wp--preset--color--cyan-bluish-gray) !important }
    .has-white-border-color { border-color: var(--wp--preset--color--white) !important }
    .has-pale-pink-border-color { border-color: var(--wp--preset--color--pale-pink) !important }
    .has-vivid-red-border-color { border-color: var(--wp--preset--color--vivid-red) !important }
    .has-luminous-vivid-orange-border-color { border-color: var(--wp--preset--color--luminous-vivid-orange) !important }
    .has-luminous-vivid-amber-border-color { border-color: var(--wp--preset--color--luminous-vivid-amber) !important }
    .has-light-green-cyan-border-color { border-color: var(--wp--preset--color--light-green-cyan) !important }
    .has-vivid-green-cyan-border-color { border-color: var(--wp--preset--color--vivid-green-cyan) !important }
    .has-pale-cyan-blue-border-color { border-color: var(--wp--preset--color--pale-cyan-blue) !important }
    .has-vivid-cyan-blue-border-color { border-color: var(--wp--preset--color--vivid-cyan-blue) !important }
    .has-vivid-purple-border-color { border-color: var(--wp--preset--color--vivid-purple) !important }
    .has-vivid-cyan-blue-to-vivid-purple-gradient-background { background: var(--wp--preset--gradient--vivid-cyan-blue-to-vivid-purple) !important }
    .has-light-green-cyan-to-vivid-green-cyan-gradient-background { background: var(--wp--preset--gradient--light-green-cyan-to-vivid-green-cyan) !important }
    .has-luminous-vivid-amber-to-luminous-vivid-orange-gradient-background { background: var(--wp--preset--gradient--luminous-vivid-amber-to-luminous-vivid-orange) !important }
    .has-luminous-vivid-orange-to-vivid-red-gradient-background { background: var(--wp--preset--gradient--luminous-vivid-orange-to-vivid-red) !important }
    .has-very-light-gray-to-cyan-bluish-gray-gradient-background { background: var(--wp--preset--gradient--very-light-gray-to-cyan-bluish-gray) !important }
    .has-cool-to-warm-spectrum-gradient-background { background: var(--wp--preset--gradient--cool-to-warm-spectrum) !important }
    .has-blush-light-purple-gradient-background { background: var(--wp--preset--gradient--blush-light-purple) !important }
    .has-blush-bordeaux-gradient-background { background: var(--wp--preset--gradient--blush-bordeaux) !important }
    .has-luminous-dusk-gradient-background { background: var(--wp--preset--gradient--luminous-dusk) !important }
    .has-pale-ocean-gradient-background { background: var(--wp--preset--gradient--pale-ocean) !important }
    .has-electric-grass-gradient-background { background: var(--wp--preset--gradient--electric-grass) !important }
    .has-midnight-gradient-background { background: var(--wp--preset--gradient--midnight) !important }
    .has-small-font-size { font-size: var(--wp--preset--font-size--small) !important }
    .has-medium-font-size { font-size: var(--wp--preset--font-size--medium) !important }
    .has-large-font-size { font-size: var(--wp--preset--font-size--large) !important }
    .has-x-large-font-size { font-size: var(--wp--preset--font-size--x-large) !important }
  </style>

  <style id="classic-theme-styles-inline-css" type="text/css">
    .wp-block-button__link { color:#fff; background-color:#32373c; border-radius:9999px; box-shadow:none; text-decoration:none; padding:calc(.667em + 2px) calc(1.333em + 2px); font-size:1.125em }
    .wp-block-file__button { background:#32373c; color:#fff; text-decoration:none }
  </style>

  <style id="woocommerce-inline-inline-css" type="text/css">
    .woocommerce form .form-row .required { visibility: visible; }
  </style>
`;
}

export function getHeadScripts(): string {
  return `
  <script type="text/javascript" src="/wp-includes/js/dist/hooks.min.js@ver=dd5603f07f9220ed27f1" id="wp-hooks-js"></script>
  <script type="text/javascript" src="/wp-includes/js/jquery/jquery.min.js@ver=3.7.1" id="jquery-core-js"></script>
  <script type="text/javascript" src="/wp-includes/js/jquery/jquery-migrate.min.js@ver=3.4.1" id="jquery-migrate-js"></script>
  <script type="text/javascript" src="/wp-content/plugins/woocommerce/assets/js/jquery-blockui/jquery.blockUI.min.js@ver=2.7.0-wc.10.3.6" id="wc-jquery-blockui-js" defer data-wp-strategy="defer"></script>
  <script type="text/javascript" id="wc-add-to-cart-js-extra">
    var wc_add_to_cart_params = {"ajax_url":"/wp-admin/admin-ajax.php","wc_ajax_url":"/?wc-ajax=%%endpoint%%","i18n_view_cart":"View cart","cart_url":"/cart/","is_cart":"","cart_redirect_after_add":"no"};
  </script>
  <script type="text/javascript" src="/wp-content/plugins/woocommerce/assets/js/frontend/add-to-cart.min.js@ver=10.3.6" id="wc-add-to-cart-js" defer data-wp-strategy="defer"></script>
  <script type="text/javascript" src="/wp-content/plugins/woocommerce/assets/js/js-cookie/js.cookie.min.js@ver=2.1.4-wc.10.3.6" id="wc-js-cookie-js" defer data-wp-strategy="defer"></script>
  <script type="text/javascript" id="woocommerce-js-extra">
    var woocommerce_params = {"ajax_url":"/wp-admin/admin-ajax.php","wc_ajax_url":"/?wc-ajax=%%endpoint%%","i18n_password_show":"Show password","i18n_password_hide":"Hide password"};
  </script>
  <script type="text/javascript" src="/wp-content/plugins/woocommerce/assets/js/frontend/woocommerce.min.js@ver=10.3.6" id="woocommerce-js" defer data-wp-strategy="defer"></script>
  <script type="text/javascript" id="startdigital-js-extra">
    var sd_ajax = {"ajax_url":"/wp-admin/admin-ajax.php"};
  </script>
  <script type="text/javascript" src="/wp-content/themes/startdigital/static/site.js?ver=1741677341" id="startdigital-js"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
  <script type="text/javascript" src="/wp-content/plugins/brew-newsletter-modal/includes/public/scripts.min.js@ver=1.0" id="brew_newsletter_script-js"></script>
  <script type="text/javascript" src="/wp-content/plugins/start-banner/includes/public/scripts.min.js@ver=1.0" id="start_banner_script-js"></script>
`;
}

export function getBodyEndScripts(): string {
  return `
  <script type="text/javascript">
    (function(){var c=document.body.className;c=c.replace(/woocommerce-no-js/,'woocommerce-js');document.body.className=c;})();
  </script>
  <script type="text/javascript" src="/wp-includes/js/dist/i18n.min.js@ver=c26c3dc7bed366793375" id="wp-i18n-js"></script>
  <script type="text/javascript" id="wp-i18n-js-after">
    wp.i18n.setLocaleData({'text direction\\u0004ltr':['ltr']});
  </script>
  <script type="text/javascript" src="/wp-content/themes/startdigital/static/partytown.bundle.js@ver=1.0" id="partytown-js"></script>
  <script type="text/javascript" src="/wp-content/plugins/woocommerce/assets/js/sourcebuster/sourcebuster.min.js@ver=10.3.6" id="sourcebuster-js-js"></script>
  <script type="text/javascript" id="wc-order-attribution-js-extra">
    var wc_order_attribution = {"params":{"lifetime":1.0e-5,"session":30,"base64":false,"ajaxurl":"/wp-admin/admin-ajax.php","prefix":"wc_order_attribution_","allowTracking":true},"fields":{"source_type":"current.typ","referrer":"current_add.rf","utm_campaign":"current.cmp","utm_source":"current.src","utm_medium":"current.mdm","utm_content":"current.cnt","utm_id":"current.id","utm_term":"current.trm","utm_source_platform":"current.plt","utm_creative_format":"current.fmt","utm_marketing_tactic":"current.tct","session_entry":"current_add.ep","session_start_time":"current_add.fd","session_pages":"session.pgs","session_count":"udata.vst","user_agent":"udata.uag"}};
  </script>
  <script type="text/javascript" src="/wp-content/plugins/woocommerce/assets/js/frontend/order-attribution.min.js@ver=10.3.6" id="wc-order-attribution-js"></script>
  <script type="text/javascript" src="/wp-includes/js/dist/dom-ready.min.js@ver=f77871ff7694fffea381" id="wp-dom-ready-js"></script>
  <script type="text/javascript" src="/wp-includes/js/dist/a11y.min.js@ver=cb460b4676c94bd228ed" id="wp-a11y-js"></script>
  <script type="text/javascript" src="/wp-content/plugins/woocommerce-google-analytics-integration/assets/js/build/main.js@ver=ecfb1dac432d1af3fbe6" id="woocommerce-google-analytics-integration-js"></script>
  <script type="text/javascript" id="woocommerce-google-analytics-integration-data-js-after">
    window.ga4w = {data:{"cart":{"items":[],"coupons":[],"totals":{"currency_code":"AUD","total_price":0,"currency_minor_unit":2}}},settings:{"tracker_function_name":"gtag","events":["purchase","add_to_cart","remove_from_cart","view_item_list","select_content","view_item","begin_checkout"],"identifier":null}};document.dispatchEvent(new Event("ga4w:ready"));
  </script>
`;
}
