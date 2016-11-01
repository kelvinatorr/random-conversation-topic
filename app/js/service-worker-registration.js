/**
 * Created by Kelvin on 10/27/2016.
 */
'use strict';

if ('serviceWorker' in navigator) {
    // Your service-worker.js *must* be located at the top-level directory relative to your site.
    // It won't be able to control pages unless it's located at the same level or higher than them.
    // *Don't* register service worker file in, e.g., a scripts/ sub-directory!
    // See https://github.com/slightlyoff/ServiceWorker/issues/468
    console.log('running service worker register');

    navigator.serviceWorker.register('/service-worker.js').then(function(reg) {
        console.log('Registration worked! ', reg);
        reg.addEventListener('updatefound', function () {
            console.log('update found event fired');
        });
    }).catch(function() {
        console.log('Registration failed!');
    });
    //navigator.serviceWorker.register('/service-worker.js').then(function(reg) {
    //    //if (!navigator.serviceWorker.controller) {
    //    //    return;
    //    //}
    //    //
    //
    //    console.log('This is reg ', reg);
    //    if (reg.waiting) {
    //        console.log('update ready!');
    //        //indexController._updateReady(reg.waiting);
    //        return;
    //    }
    //
    //    if (reg.installing) {
    //        console.log('installing');
    //        //indexController._trackInstalling(reg.installing);
    //        return;
    //    }
    //
    //    reg.addEventListener('updatefound', function() {
    //        console.log('update found event fired');
    //        //indexController._trackInstalling(reg.installing);
    //    });
    //});
}