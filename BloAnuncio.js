// ==UserScript==
// @name         Bloqueador de Anuncios
// @namespace    http://tampermonkey.net/
// @version      4.0
// @description  Bloqueador de Anuncios
// @author       Donny
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @updateURL    https://github.com/TheRealJoelmatic/RemoveAdblockThing/raw/main/Youtube-Ad-blocker-Reminder-Remover.user.js
// @downloadURL  https://github.com/TheRealJoelmatic/RemoveAdblockThing/raw/main/Youtube-Ad-blocker-Reminder-Remover.user.js
// @grant        none
// ==/UserScript==

(function() {
    //
    //      Configuración
    //

    // Habilitar el Bloqueador de Anuncios no detectado
    const adblocker = true;

    // Habilitar el eliminador de ventanas emergentes (innecesario si tienes el Bloqueador de Anuncios no detectado)
    const removePopup = false;

    // Verificar actualizaciones (Elimina la ventana emergente)
    const updateCheck = true;

    // Habilitar mensajes de depuración en la consola
    const debugMessages = true;

    // Habilitar modal personalizado
    // Utiliza la biblioteca SweetAlert2 (https://cdn.jsdelivr.net/npm/sweetalert2@11) para el modal de versión de actualización.
    // Cuando se establece en false, se utilizará la ventana emergente predeterminada y la biblioteca no se cargará.
    const updateModal = {
        enable: true, // si es true, reemplaza la ventana emergente predeterminada con un modal personalizado
        timer: 5000, // timer: número | false
    };


    //
    //      CÓDIGO
    //
    // Si tienes alguna sugerencia, informe de errores,
    // o quieres contribuir a este userscript,
    // siéntete libre de crear problemas o solicitudes de extracción en el repositorio de GitHub.
    //
    // GITHUB: https://github.com/TheRealJoelmatic/RemoveAdblockThing

    //
    // Variables usadas para el bloqueador de anuncios
    //

    // Almacenar la URL inicial
    let currentUrl = window.location.href;

    // Usado para determinar si se encontró un anuncio
    let isAdFound = false;

    // usado para ver cuántas veces hemos recorrido con un anuncio activo
    let adLoop = 0;

    //
    // Variables usadas para la actualización
    //

    let hasIgnoredUpdate = false;

    //
    // Configuración
    //

    // Configura todo aquí
    log("Script iniciado");

    if (adblocker) removeAds();
    if (removePopup) popupRemover();
    if (updateCheck) checkForUpdate();

    // Eliminar las molestas ventanas emergentes
    function popupRemover() {
        setInterval(() => {
            const modalOverlay = document.querySelector("tp-yt-iron-overlay-backdrop");
            const popup = document.querySelector(".style-scope ytd-enforcement-message-view-model");
            const popupButton = document.getElementById("dismiss-button");

            var video = document.querySelector('video');

            const bodyStyle = document.body.style;
            bodyStyle.setProperty('overflow-y', 'auto', 'important');

            if (modalOverlay) {
                modalOverlay.removeAttribute("opened");
                modalOverlay.remove();
            }

            if (popup) {
                log("Ventana emergente detectada, eliminando...");

                if(popupButton) popupButton.click();

                popup.remove();
                video.play();

                setTimeout(() => {
                    video.play();
                }, 500);

                log("Ventana emergente eliminada");
            }
            // Verificar si el video está en pausa después de eliminar la ventana emergente
            if (!video.paused) return;
            // Reanudar el video
            video.play();

        }, 1000);
    }
    // Método de bloqueador de anuncios no detectado
    function removeAds()
    {
        log("removeAds()");

        var videoPlayback = 1;

        setInterval(() =>{

            var video = document.querySelector('video');
            const ad = [...document.querySelectorAll('.ad-showing')][0];


            // Eliminar anuncios de la página
            if (window.location.href !== currentUrl) {
                currentUrl = window.location.href;
                removePageAds();
            }

            if (ad)
            {
                isAdFound = true;
                adLoop = adLoop + 1;

                //
                // Método de centro de anuncios
                //

                // Si lo intentamos 10 veces, podemos asumir que no funcionará esta vez (esto detiene la pausa/congelación extraña en los anuncios)

                if(adLoop < 10){
                    const openAdCenterButton = document.querySelector('.ytp-ad-button-icon');
                    openAdCenterButton?.click();

                    const blockAdButton = document.querySelector('[label="Bloquear anuncio"]');
                    blockAdButton?.click();

                    const blockAdButtonConfirm = document.querySelector('.Eddif [label="CONTINUAR"] button');
                    blockAdButtonConfirm?.click();

                    const closeAdCenterButton = document.querySelector('.zBmRhe-Bz112c');
                    closeAdCenterButton?.click();
                }
                else{
                    if (video) video.play();
                }

              var popupContainer = document.querySelector('body > ytd-app > ytd-popup-container > tp-yt-paper-dialog');
              if (popupContainer)
                // el contenedor de la ventana emergente persiste, no lo spammeemos
                if (popupContainer.style.display == "")
                  popupContainer.style.display = 'none';

                //
                // Método de salto de velocidad
                //
                log("Anuncio encontrado");


                const skipButtons = ['ytp-ad-skip-button-container', 'ytp-ad-skip-button-modern', '.videoAdUiSkipButton', '.ytp-ad-skip-button', '.ytp-ad-skip-button-modern', '.ytp-ad-skip-button', '.ytp-ad-skip-button-slot' ];

                // Agregar un poco de ofuscación al saltar al final del video.
                if (video){

                    video.playbackRate = 10;
                    video.volume = 0;

                    // Iterar a través del array de selectores
                    skipButtons.forEach(selector => {
                        // Seleccionar todos los elementos que coincidan con el selector actual
                        const elements = document.querySelectorAll(selector);

                        // Verificar si se encontraron elementos
                        if (elements && elements.length > 0) {
                          // Iterar a través de los elementos seleccionados y hacer clic
                          elements.forEach(element => {
                            element?.click();
                          });
                        }
                    });
                    video.play();

                    let randomNumber = Math.random() * (0.5 - 0.1) + 0.1;
                    video.currentTime = video.duration + randomNumber || 0;
                }

                log("Anuncio omitido (✔️)");

            } else {

                // verificar la velocidad de reproducción no razonable
                if(video && video?.playbackRate == 10){
                    video.playbackRate = videoPlayback;
                }

                if (isAdFound){
                    isAdFound = false;

                    // esto es justo después de que se omite el anuncio
                    // corrige si estableces la velocidad en 2x y se reproduce un anuncio, lo restablece al valor predeterminado 1x


                    // algo salió mal, volver a 1x
                    if (videoPlayback == 10) videoPlayback = 1;
                    if(video && isFinite(videoPlayback)) video.playbackRate = videoPlayback;

                    // restablecer el bucle de anuncios al valor predeterminado
                    adLoop = 0;
                }
                else{
                    if(video) videoPlayback = video.playbackRate;
                }
            }

        }, 50)

        removePageAds();
    }

    // Eliminar los anuncios de la página (no los anuncios del reproductor de video)
    function removePageAds(){

        const sponsor = document.querySelectorAll("div#player-ads.style-scope.ytd-watch-flexy, div#panels.style-scope.ytd-watch-flexy");
        const style = document.createElement('style');

        style.textContent = `
            ytd-action-companion-ad-renderer,
            ytd-display-ad-renderer,
            ytd-video-masthead-ad-advertiser-info-renderer,
            ytd-video-masthead-ad-primary-video-renderer,
            ytd-in-feed-ad-layout-renderer,
            ytd-ad-slot-renderer,
            yt-about-this-ad-renderer,
            yt-mealbar-promo-renderer,
            ytd-statement-banner-renderer,
            ytd-ad-slot-renderer,
            ytd-in-feed-ad-layout-renderer,
            ytd-banner-promo-renderer-background
            statement-banner-style-type-compact,
            .ytd-video-masthead-ad-v3-renderer,
            div#root.style-scope.ytd-display-ad-renderer.yt-simple-endpoint,
            div#sparkles-container.style-scope.ytd-promoted-sparkles-web-renderer,
            div#main-container.style-scope.ytd-promoted-video-renderer,
            div#player-ads.style-scope.ytd-watch-flexy,
            ad-slot-renderer,
            ytm-promoted-sparkles-web-renderer,
            masthead-ad,
            tp-yt-iron-overlay-backdrop,

            #masthead-ad {
                display: none !important;
            }
        `;

        document.head.appendChild(style);

        sponsor?.forEach((element) => {
             if (element.getAttribute("id") === "rendering-content") {
                element.childNodes?.forEach((childElement) => {
                  if (childElement?.data.targetId && childElement?.data.targetId !=="engagement-panel-macro-markers-description-chapters"){
                      // Saltar la sección de Capítulos
                        element.style.display = 'none';
                    }
                   });
            }
         });

        log("Anuncios de la página eliminados (✔️)");
    }

    //
    // Verificar actualizaciones
    //

    function checkForUpdate(){

        if (window.top !== window.self && !(window.location.href.includes("youtube.com"))){
            return;
        }

        if (hasIgnoredUpdate){
            return;
        }

        const scriptUrl = 'https://raw.githubusercontent.com/TheRealJoelmatic/RemoveAdblockThing/main/Youtube-Ad-blocker-Reminder-Remover.user.js';

        fetch(scriptUrl)
        .then(response => response.text())
        .then(data => {
            // Extraer la versión del script en GitHub
            const match = data.match(/@version\s+(\d+\.\d+)/);
            if (!match) {
                log("No se puede extraer la versión del script en GitHub.", "e")
                return;
            }

            const githubVersion = parseFloat(match[1]);
            const currentVersion = parseFloat(GM_info.script.version);

            if (githubVersion <= currentVersion) {
                log('Tienes la última versión del script. ' + githubVersion + " : " + currentVersion);
                return;
            }

            console.log('Eliminar Bloqueador de Anuncios: Hay una nueva versión disponible. Por favor, actualiza tu script. ' + githubVersion + " : " + currentVersion);

            if(updateModal.enable){
                // si se omite una versión, no mostrar el mensaje de actualización nuevamente hasta la próxima versión
                if (parseFloat(localStorage.getItem('skipRemoveAdblockThingVersion')) === githubVersion) {
                    return;
                }
                // Si está habilitado, incluir la biblioteca SweetAlert2
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11';
                document.head.appendChild(script);

                const style = document.createElement('style');
                style.textContent = '.swal2-container { z-index: 2400; }';
                document.head.appendChild(style);

                // Espera a que SweetAlert se cargue completamente
                script.onload = function () {

                    Swal.fire({
                        position: "top-end",
                        backdrop: false,
                        title: 'Eliminar Bloqueador de Anuncios: Hay una nueva versión disponible.',
                        text: '¿Quieres actualizar?',
                        showCancelButton: true,
                        showDenyButton: true,
                        confirmButtonText: 'Actualizar',
                        denyButtonText:'Omitir',
                        cancelButtonText: 'Cerrar',
                        timer: updateModal.timer ?? 5000,
                        timerProgressBar: true,
                        didOpen: (modal) => {
                            modal.onmouseenter = Swal.stopTimer;
                            modal.onmouseleave = Swal.resumeTimer;
                        }
                    }).then((result) => {
                        if (result.isConfirmed) {
                            window.location.replace(scriptUrl);
                        } else if(result.isDenied) {
                            localStorage.setItem('skipRemoveAdblockThingVersion', githubVersion);
                        }
                    });
                };

                script.onerror = function () {
                    var result = window.confirm("Eliminar Bloqueador de Anuncios: Hay una nueva versión disponible. Por favor, actualiza tu script.");
                    if (result) {
                        window.location.replace(scriptUrl);
                    }
                }
            } else {
                var result = window.confirm("Eliminar Bloqueador de Anuncios: Hay una nueva versión disponible. Por favor, actualiza tu script.");

                if (result) {
                    window.location.replace(scriptUrl);
                }
            }
        })
        .catch(error => {
            hasIgnoredUpdate = true;
            log("Error al verificar actualizaciones:", "e", error)
        });
        hasIgnoredUpdate = true;
    }

    // Utilizado para mensajes de depuración
    function log(log, level = 'l', ...args) {
        if (!debugMessages) return;

        const prefix = 'Eliminar Bloqueador de Anuncios:'
        const message = `${prefix} ${log}`;
        switch (level) {
            case 'e':
            case 'err':
            case 'error':
                console.error(message, ...args);
                break;
            case 'l':
            case 'log':
                console.log(message, ...args);
                break;
            case 'w':
            case 'warn':
            case 'warning':
                console.warn(message, ...args);
                break;
            case 'i':
            case 'info':
            default:
        console.info(message, ...args);
        break
    }
    }

})();
