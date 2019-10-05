__webpack_public_path__ = window.__webpack_public_path__; // eslint-disable-line

import Global from './theme/global';
import swal from 'sweetalert';

const getAccount = () => import('./theme/account');
const getLogin = () => import('./theme/auth');
const noop = null;

const pageClasses = {
    account_orderstatus: getAccount,
    account_order: getAccount,
    account_addressbook: getAccount,
    shippingaddressform: getAccount,
    account_new_return: getAccount,
    'add-wishlist': () => import('./theme/wishlist'),
    account_recentitems: getAccount,
    account_downloaditem: getAccount,
    editaccount: getAccount,
    account_inbox: getAccount,
    account_saved_return: getAccount,
    account_returns: getAccount,
    account_paymentmethods: getAccount,
    account_addpaymentmethod: getAccount,
    account_editpaymentmethod: getAccount,
    login: getLogin,
    createaccount_thanks: getLogin,
    createaccount: getLogin,
    getnewpassword: getLogin,
    forgotpassword: getLogin,
    blog: noop,
    blog_post: noop,
    brand: () => import('./theme/brand'),
    brands: noop,
    cart: () => import('./theme/cart'),
    category: () => import('./theme/category'),
    compare: () => import('./theme/compare'),
    page_contact_form: () => import('./theme/contact-us'),
    error: noop,
    404: noop,
    giftcertificates: () => import('./theme/gift-certificate'),
    giftcertificates_balance: () => import('./theme/gift-certificate'),
    giftcertificates_redeem: () => import('./theme/gift-certificate'),
    default: noop,
    page: noop,
    product: () => import('./theme/product'),
    amp_product_options: () => import('./theme/product'),
    search: () => import('./theme/search'),
    rss: noop,
    sitemap: noop,
    newsletter_subscribe: noop,
    wishlist: () => import('./theme/wishlist'),
    wishlists: () => import('./theme/wishlist'),
};

const customClasses = {};

/**
 * This function gets added to the global window and then called
 * on page load with the current template loaded and JS Context passed in
 * @param pageType String
 * @param contextJSON
 * @returns {*}
 */
window.stencilBootstrap = function stencilBootstrap(pageType, contextJSON = null, loadGlobal = true) {
    const context = JSON.parse(contextJSON || '{}');

    return {
        load() {
            $(() => {
                // Load globals
                if (loadGlobal) {
                    Global.load(context);
                }

                const importPromises = [];

                // Find the appropriate page loader based on pageType
                const pageClassImporter = pageClasses[pageType];
                if (typeof pageClassImporter === 'function') {
                    importPromises.push(pageClassImporter());
                }

                // See if there is a page class default for a custom template
                const customTemplateImporter = customClasses[context.template];
                if (typeof customTemplateImporter === 'function') {
                    importPromises.push(customTemplateImporter());
                }

                // Wait for imports to resolve, then call load() on them
                Promise.all(importPromises).then(imports => {
                    imports.forEach(imported => {
                        imported.default.load(context);
                    });
                });
            });
        },
    };
};
function postData(url = '', cartItems = {}) {
    return fetch(url, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json' },
        body: JSON.stringify(cartItems),
    })
    .then(response => response.json());
}
function callPostData(url = '', cartItems = {}) {
    postData(url, {
        lineItems: cartItems }
    )
    .then((data) => {
        // Error Handling:
        if (data && (data.status === 404 || data.status === 422)) {
            swal('There was an error', `Details: ${data.detail} - Please contact admin`, 'error');
        } else {
            swal({
                title: 'One Step Closer to joining the Cooking Club',
                text: 'A number of products have been placed into your cart please check out to finish or continue shopping',
                icon: 'info',
                buttons: ['Continue Shopping', 'Checkout'],
                dangerMode: false,
            })
            .then((checkout) => {
                if (checkout) {
                    window.location = '/cart.php';
                }
            });
        }
    })
    .catch((error) => {
        swal('There was an error', `Details: ${error} - Please contact admin`, 'error');
    });
}
$(document).ready(() => {
    $('#cookingClubJoin').on('click', () => {
        // INitial batch of inserted products
        const lineItems = [
            {
                quantity: 1,
                productId: 80,
            },
            {
                quantity: 1,
                productId: 81,
            },
            {
                quantity: 1,
                productId: 93,
                optionSelections: [
                    {
                        optionId: 111,
                        optionValue: 8,
                    },
                    {
                        optionId: 112,
                        optionValue: 96,
                    },
                ],
            },
        ];
        fetch('/api/storefront/cart?include=lineItems.digitalItems.options,lineItems.physicalItems.options', {
            credentials: 'same-origin',
        })
        .then((response) => response.json())
        .then((myJson) => {
            let url;
            // if cart already exists different path would need to be passed to it.
            if (myJson.length > 0 && myJson[0].id) {
                const cartId = myJson[0].id;
                url = `/api/storefront/carts/${cartId}/items`;
            } else {
                url = '/api/storefront/cart';
            }
            callPostData(url, lineItems);
        });
    });
});
